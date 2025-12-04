use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{MARKET_SEED, PLATFORM_CONFIG_SEED, PLATFORM_TREASURY_SEED};
use crate::state::{Market, PlatformConfig};

#[derive(Accounts)]
pub struct ProposeMarket<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        seeds = [PLATFORM_CONFIG_SEED, platform_config.admin.key().as_ref()],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    #[account(seeds = [PLATFORM_TREASURY_SEED, platform_config.key().as_ref()], bump = platform_config.treasury_bump)]
    pub platform_treasury: SystemAccount<'info>,

    #[account(
        init,
        payer = creator,
        seeds = [MARKET_SEED, platform_config.key().as_ref()],
        space = 8 + Market::INIT_SPACE,
        bump,
    )]
    pub market: Account<'info, Market>,

    pub system_program: Program<'info, System>,
}

impl<'info> ProposeMarket<'info> {
    pub fn propose_market(
        &mut self,
        start_time: i64,
        end_time: i64,
        min_prediction_price: u64,
        question: String,
        description: String,
        bumps: &ProposeMarketBumps,
    ) -> Result<()> {
        // 1. Collect the market proposal fee
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.creator.to_account_info(),
            to: self.platform_treasury.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_ctx, self.platform_config.market_proposal_fee)?;

        // 2. Set the market fields
        self.market.set_inner(Market {
            bump: bumps.market,
            start_time,
            end_time,
            question,
            description,
            min_prediction_price,
            is_approved: false,
            is_resolved: false,
            resolution: None,
            total_pool: 0,
            total_positions: 0,
            creator: self.creator.key(),
        });

        Ok(())
    }
}
