use anchor_lang::prelude::*;

use crate::constants::{
    MARKET_CONFIG_SEED, MARKET_DESCRIPTION_MAX_LEN, MARKET_QUESTION_MAX_LEN, MARKET_STATE_SEED,
    PLATFORM_CONFIG_SEED,
};
use crate::error::MarketError;
use crate::state::{MarketConfig, MarketState, PlatformConfig};

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct UpdateMarketConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [PLATFORM_CONFIG_SEED, admin.key().as_ref()],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    #[account(
        mut,
        seeds = [MARKET_CONFIG_SEED, market_config.market_id.to_le_bytes().as_ref(), platform_config.key().as_ref()],
        bump = market_config.bump,
    )]
    pub market_config: Account<'info, MarketConfig>,

    #[account(
        seeds = [MARKET_STATE_SEED, market_config.key().as_ref(), platform_config.key().as_ref()],
        bump = market_state.bump,
    )]
    pub market_state: Account<'info, MarketState>,

    pub system_program: Program<'info, System>,
}

impl<'info> UpdateMarketConfig<'info> {
    pub fn update_market_config(
        &mut self,
        start_time: Option<i64>,
        end_time: Option<i64>,
        min_prediction_price: Option<u64>,
        question: Option<String>,
        description: Option<String>,
    ) -> Result<()> {
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

        if let Some(start) = start_time {
            let now = Clock::get()?.unix_timestamp;
            require!(start > now, MarketError::StartTimeInPast);
            let end_check = end_time.unwrap_or(self.market_config.end_time);
            require!(start < end_check, MarketError::InvalidEndTime);
        }

        if let Some(end) = end_time {
            let start_check = start_time.unwrap_or(self.market_config.start_time);
            require!(end > start_check, MarketError::InvalidEndTime);
        }

        if let Some(min) = min_prediction_price {
            require!(min > 0, MarketError::MinPredictionPriceZero);
        }

        if let Some(ref q) = question {
            require!(
                q.as_bytes().len() <= MARKET_QUESTION_MAX_LEN,
                MarketError::QuestionTooLong
            );
        }

        if let Some(ref d) = description {
            require!(
                d.as_bytes().len() <= MARKET_DESCRIPTION_MAX_LEN,
                MarketError::DescriptionTooLong
            );
        }

        if let Some(v) = start_time {
            self.market_config.start_time = v;
        }

        if let Some(v) = end_time {
            self.market_config.end_time = v;
        }

        if let Some(v) = min_prediction_price {
            self.market_config.min_prediction_price = v;
        }

        if let Some(v) = question {
            self.market_config.question = v;
        }

        if let Some(v) = description {
            self.market_config.description = v;
        }

        Ok(())
    }
}
