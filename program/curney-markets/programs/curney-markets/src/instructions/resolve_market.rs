use anchor_lang::prelude::*;

use crate::constants::{MARKET_CONFIG_SEED, MARKET_STATE_SEED, PLATFORM_CONFIG_SEED};
use crate::error::MarketError;
use crate::state::{MarketConfig, MarketState, PlatformConfig};

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [PLATFORM_CONFIG_SEED, admin.key().as_ref()],
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

    pub system_program: Program<'info, System>,
}

impl<'info> ResolveMarket<'info> {
    pub fn resolve_market(&mut self, resolution: i64, total_scores: u128) -> Result<()> {
        require!(
            self.admin.key() == self.platform_config.admin,
            MarketError::Unauthorized
        );

        require!(
            self.market_state.is_approved,
            MarketError::MarketNotApproved
        );

        require!(
            !self.market_state.is_resolved,
            MarketError::MarketAlreadyResolved
        );

        let now = Clock::get()?.unix_timestamp;
        require!(
            now >= self.market_config.end_time,
            MarketError::MarketNotEnded
        );

        self.market_state.total_scores = Some(total_scores);
        self.market_state.resolution = Some(resolution);
        self.market_state.is_resolved = true;

        Ok(())
    }
}
