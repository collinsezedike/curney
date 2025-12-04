use anchor_lang::prelude::*;

use crate::constants::{
    MARKET_CONFIG_SEED, MARKET_DESCRIPTION_MAX_LEN, MARKET_QUESTION_MAX_LEN, MARKET_STATE_SEED,
    PLATFORM_CONFIG_SEED,
};
use crate::error::MarketError;
use crate::state::{MarketConfig, MarketState, PlatformConfig};

#[derive(Accounts)]
pub struct ApproveMarket<'info> {
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

impl<'info> ApproveMarket<'info> {
    pub fn approve_market(&mut self) -> Result<()> {
        require!(
            self.admin.key() == self.platform_config.admin,
            MarketError::Unauthorized
        );

        require!(
            !self.market_state.is_approved,
            MarketError::MarketAlreadyApproved
        );

        require!(
            !self.market_state.is_resolved,
            MarketError::MarketAlreadyResolved
        );

        require!(
            self.market_config.question.as_bytes().len() <= MARKET_QUESTION_MAX_LEN,
            MarketError::QuestionTooLong
        );

        require!(
            self.market_config.description.as_bytes().len() <= MARKET_DESCRIPTION_MAX_LEN,
            MarketError::DescriptionTooLong
        );

        require!(
            self.market_config.start_time < self.market_config.end_time,
            MarketError::InvalidEndTime
        );

        require!(
            self.market_config.min_prediction_price > 0,
            MarketError::MinPredictionPriceZero
        );

        self.market_state.is_approved = true;

        Ok(())
    }
}
