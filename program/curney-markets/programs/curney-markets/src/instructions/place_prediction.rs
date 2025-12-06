use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{
    FIXED_POINT_SCALE, MARKET_CONFIG_SEED, MARKET_STATE_SEED, MARKET_VAULT_SEED,
    PLATFORM_CONFIG_SEED, PLATFORM_TREASURY_SEED, POSITION_SEED,
};
use crate::error::MarketError;
use crate::state::{MarketConfig, MarketState, PlatformConfig, Position};

fn calculate_new_decay(old_decay: u64, start_time: i64, end_time: i64, now: i64) -> Result<u64> {
    let duration = (end_time - start_time) as u64;
    require!(duration > 0, MarketError::InvalidEndTime);

    let elapsed = (now - start_time).max(0) as u64;
    let progress = (elapsed * FIXED_POINT_SCALE) / duration;
    let remaining = FIXED_POINT_SCALE
        .checked_sub(progress)
        .ok_or(MarketError::MathOverflow)?;

    let new_decay = (old_decay as u128)
        .checked_mul(remaining as u128)
        .ok_or(MarketError::MathOverflow)?
        / (FIXED_POINT_SCALE as u128);

    Ok(new_decay.max(0) as u64)
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

    #[account(mut, seeds = [PLATFORM_TREASURY_SEED, platform_config.key().as_ref()], bump = platform_config.treasury_bump)]
    pub platform_treasury: SystemAccount<'info>,

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

        // Take platform fee
        let platform_fee = (self.platform_config.platform_fee_bps as u64 * stake_amount) / 10000;

        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.platform_treasury.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_ctx, platform_fee)?;

        // Calculate creator fee and actual user stake amount
        let creator_fee = (self.platform_config.creator_fee_bps as u64 * stake_amount) / 10000;

        let actual_stake = stake_amount - platform_fee - creator_fee;

        // Transfer both the user stake and the creator fee to the market vault
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.market_vault.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_ctx, actual_stake + creator_fee)?;

        self.position.set_inner(Position {
            bump: bumps.position,
            user: self.user.key(),
            market: self.market_config.key(),
            decay: self.market_state.decay,
            index: self.market_state.total_positions,
            timestamp: now,
            claimed: false,
            reward: None,
            stake: actual_stake,
            prediction,
        });

        self.market_state.total_pool = self
            .market_state
            .total_pool
            .checked_add(actual_stake)
            .ok_or(MarketError::MathOverflow)?;

        self.market_state.total_positions = self
            .market_state
            .total_positions
            .checked_add(1)
            .ok_or(MarketError::MathOverflow)?;

        self.market_state.creator_fee_revenue = self
            .market_state
            .creator_fee_revenue
            .checked_add(creator_fee)
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
