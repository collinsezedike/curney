use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{
    MARKET_CONFIG_SEED, MARKET_DESCRIPTION_MAX_LEN, MARKET_QUESTION_MAX_LEN, MARKET_STATE_SEED,
    PLATFORM_CONFIG_SEED, PLATFORM_TREASURY_SEED,
};
use crate::error::MarketError;
use crate::state::{MarketConfig, MarketState, PlatformConfig};

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct ProposeMarket<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        seeds = [PLATFORM_CONFIG_SEED, platform_config.admin.key().as_ref()],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    #[account(mut, seeds = [PLATFORM_TREASURY_SEED, platform_config.key().as_ref()], bump = platform_config.treasury_bump)]
    pub platform_treasury: SystemAccount<'info>,

    #[account(
        init,
        payer = creator,
        seeds = [MARKET_CONFIG_SEED, market_id.to_be_bytes().as_ref(), platform_config.key().as_ref()],
        space = 8 + MarketConfig::INIT_SPACE,
        bump,
    )]
    pub market_config: Account<'info, MarketConfig>,

    #[account(
        init,
        payer = creator,
        seeds = [MARKET_STATE_SEED, market_config.key().as_ref(), platform_config.key().as_ref()],
        space = 8 + MarketState::INIT_SPACE,
        bump,
    )]
    pub market_state: Account<'info, MarketState>,

    pub system_program: Program<'info, System>,
}

impl<'info> ProposeMarket<'info> {
    pub fn propose_market(
        &mut self,
        market_id: u64,
        start_time: i64,
        end_time: i64,
        min_prediction_price: u64,
        question: String,
        description: String,
        bumps: &ProposeMarketBumps,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;

        require!(start_time >= now, MarketError::StartTimeInPast);

        require!(end_time >= start_time, MarketError::InvalidEndTime);

        require!(
            question.as_bytes().len() <= MARKET_QUESTION_MAX_LEN,
            MarketError::QuestionTooLong,
        );

        require!(
            description.as_bytes().len() <= MARKET_DESCRIPTION_MAX_LEN,
            MarketError::DescriptionTooLong
        );

        require!(
            min_prediction_price > 0,
            MarketError::MinPredictionPriceZero
        );

        // 1. Collect the market proposal fee
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.creator.to_account_info(),
            to: self.platform_treasury.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_ctx, self.platform_config.market_proposal_fee)?;

        // 2. Initialize the market accounts
        self.market_config.set_inner(MarketConfig {
            bump: bumps.market_config,
            market_id,
            start_time,
            end_time,
            min_prediction_price,
            question,
            description,
            creator: self.creator.key(),
            market_state: self.market_state.key(),
        });

        self.market_state.set_inner(MarketState {
            bump: bumps.market_state,
            is_approved: false,
            is_resolved: false,
            resolution: None,
            total_pool: 0,
            total_positions: 0,
            market_config: self.market_config.key(),
        });

        Ok(())
    }
}
