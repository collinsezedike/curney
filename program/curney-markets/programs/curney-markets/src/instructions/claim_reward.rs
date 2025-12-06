use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{
    DECAY_NORMALIZATION_FACTOR, FIXED_POINT_SCALE, MARKET_CONFIG_SEED, MARKET_STATE_SEED,
    MARKET_VAULT_SEED, PLATFORM_CONFIG_SEED, POSITION_SEED,
};
use crate::error::{MarketError, PositionError};
use crate::state::{MarketConfig, MarketState, PlatformConfig, Position};

pub fn calculate_reward(
    prediction: i64,
    resolution: i64,
    decay: u64,
    total_pool: u64,
    total_scores: u128,
) -> Result<u64> {
    require!(decay > 0, PositionError::InvalidDecay);
    if total_scores <= 0 {
        return Ok(0);
    };

    let dist = (prediction - resolution).abs() as i128;
    let decay_float = (DECAY_NORMALIZATION_FACTOR as f64 * decay as f64) / FIXED_POINT_SCALE as f64;
    let exponent = -((dist as f64 / decay_float as f64).powi(2));
    let score = (exponent.exp() * (FIXED_POINT_SCALE as f64)) as u128;
    let reward = ((score
        .checked_mul(total_pool as u128)
        .ok_or(MarketError::MathOverflow)?)
        / total_scores) as u64;

    Ok(reward)
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [PLATFORM_CONFIG_SEED, platform_config.admin.key().as_ref()],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    #[account(
        seeds = [MARKET_CONFIG_SEED, market_config.market_id.to_le_bytes().as_ref(), platform_config.key().as_ref()],
        bump = market_config.bump,
    )]
    pub market_config: Account<'info, MarketConfig>,

    #[account(
        mut,
        seeds = [MARKET_STATE_SEED, market_config.key().as_ref(), platform_config.key().as_ref()],
        bump = market_state.bump,
    )]
    pub market_state: Account<'info, MarketState>,

    #[account(mut, seeds = [MARKET_VAULT_SEED, market_config.key().as_ref()], bump = market_config.vault_bump)]
    pub market_vault: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [POSITION_SEED, position.index.to_le_bytes().as_ref(), user.key().as_ref(), market_config.key().as_ref()],
        bump = position.bump
    )]
    pub position: Account<'info, Position>,

    pub system_program: Program<'info, System>,
}

impl<'info> ClaimReward<'info> {
    pub fn claim_reward(&mut self) -> Result<()> {
        require!(
            self.market_state.is_approved,
            MarketError::MarketNotApproved
        );

        require!(
            self.market_state.is_resolved,
            MarketError::MarketNotResolved
        );

        let now = Clock::get()?.unix_timestamp;
        require!(
            now >= self.market_config.end_time,
            MarketError::MarketNotEnded
        );

        require!(!self.position.claimed, PositionError::RewardAlreadyClaimed);

        let resolution = self
            .market_state
            .resolution
            .ok_or(MarketError::MarketNotResolved)?;

        let total_scores = self
            .market_state
            .total_scores
            .ok_or(MarketError::MarketNotResolved)?;

        let reward = calculate_reward(
            self.position.prediction,
            resolution,
            self.position.decay,
            self.market_state.total_pool,
            total_scores,
        )?;

        self.position.reward = Some(reward);

        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.market_vault.to_account_info(),
            to: self.user.to_account_info(),
        };

        let seeds = &[
            MARKET_VAULT_SEED,
            self.market_config.to_account_info().key.as_ref(),
            &[self.market_config.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer(cpi_ctx, reward)?;

        self.position.claimed = true;

        Ok(())
    }
}
