use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{
    MARKET_CONFIG_SEED, MARKET_STATE_SEED, MARKET_VAULT_SEED, PLATFORM_CONFIG_SEED, POSITION_SEED,
};
use crate::error::MarketError;
use crate::state::{MarketConfig, MarketState, PlatformConfig, Position};

fn calculate_new_decay(old_decay: u64, start: i64, end: i64, now: i64) -> Result<u64> {
    let duration = (end - start) as i128;
    let elapsed = (now - start) as i128;

    require!(duration > 0, MarketError::InvalidEndTime);
    require!(elapsed >= 0, MarketError::MarketNotStarted);

    let elapsed = elapsed.min(duration);

    // Q32.32 fixed point for progress
    let progress_fp = ((elapsed << 32) / duration) as u64;

    // new_decay = old_decay * (1 - progress_fp)
    // Must convert progress_fp to a factor
    let one_fp: u64 = 1u64 << 32;

    let remaining_fp = one_fp
        .checked_sub(progress_fp)
        .ok_or(MarketError::MathOverflow)?;

    let new_decay = ((old_decay as u128 * remaining_fp as u128) >> 32) as u64;

    Ok(new_decay)
}

#[derive(Accounts)]
pub struct PlacePrediction<'info> {
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
        init,
        payer = user,
        seeds = [POSITION_SEED, market_state.total_positions.to_le_bytes().as_ref(), user.key().as_ref(), market_config.key().as_ref()],
        space = 8 + Position::INIT_SPACE,
        bump
    )]
    pub position: Account<'info, Position>,

    pub system_program: Program<'info, System>,
}

impl<'info> PlacePrediction<'info> {
    pub fn place_prediction(
        &mut self,
        prediction: i64,
        stake_amount: u64,
        bumps: &PlacePredictionBumps,
    ) -> Result<()> {
        require!(
            self.market_state.is_approved,
            MarketError::MarketNotApproved
        );

        require!(
            !self.market_state.is_resolved,
            MarketError::MarketAlreadyResolved
        );

        require!(
            stake_amount >= self.market_config.min_prediction_price,
            MarketError::StakeTooLow
        );

        let now = Clock::get()?.unix_timestamp;

        require!(
            now >= self.market_config.start_time,
            MarketError::MarketNotStarted
        );

        require!(now < self.market_config.end_time, MarketError::MarketEnded);

        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.market_vault.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_ctx, stake_amount)?;

        self.position.set_inner(Position {
            bump: bumps.position,
            user: self.user.key(),
            market: self.market_config.key(),
            decay: self.market_state.decay,
            timestamp: now,
            claimed: false,
            reward: None,
            stake: stake_amount,
            prediction,
        });

        self.market_state.total_pool = self
            .market_state
            .total_pool
            .checked_add(stake_amount)
            .ok_or(MarketError::MathOverflow)?;

        self.market_state.total_positions = self
            .market_state
            .total_positions
            .checked_add(1)
            .ok_or(MarketError::MathOverflow)?;

        self.market_state.decay = calculate_new_decay(
            self.market_state.decay,
            self.market_config.start_time,
            self.market_config.end_time,
            now,
        )?;

        Ok(())
    }
}
