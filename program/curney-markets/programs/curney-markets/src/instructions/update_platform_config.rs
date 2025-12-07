use anchor_lang::prelude::*;

use crate::constants::{BASIS_POINT_SCALE, PLATFORM_CONFIG_SEED};
use crate::error::PlatformError;
use crate::state::PlatformConfig;

#[derive(Accounts)]
pub struct UpdatePlatformConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [PLATFORM_CONFIG_SEED, admin.key().as_ref()],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    pub system_program: Program<'info, System>,
}

impl<'info> UpdatePlatformConfig<'info> {
    pub fn update_platform_config(
        &mut self,
        creator_fee_bps: Option<u16>,
        platform_fee_bps: Option<u16>,
        market_proposal_fee: Option<u64>,
    ) -> Result<()> {
        if let Some(c) = creator_fee_bps {
            require!(c <= BASIS_POINT_SCALE, PlatformError::InvalidCreatorFeeBps);
        }

        if let Some(p) = platform_fee_bps {
            require!(p <= BASIS_POINT_SCALE, PlatformError::InvalidPlatformFeeBps);
        }

        if let Some(fee) = market_proposal_fee {
            require!(fee > 0, PlatformError::InvalidMarketProposalFee);
        }

        let new_creator_fee = creator_fee_bps.unwrap_or(self.platform_config.creator_fee_bps);
        let new_platform_fee = platform_fee_bps.unwrap_or(self.platform_config.platform_fee_bps);
        require!(
            (new_creator_fee + new_platform_fee) <= BASIS_POINT_SCALE,
            PlatformError::TotalFeeTooHigh
        );

        if let Some(c) = creator_fee_bps {
            self.platform_config.creator_fee_bps = c;
        }

        if let Some(p) = platform_fee_bps {
            self.platform_config.platform_fee_bps = p;
        }

        if let Some(fee) = market_proposal_fee {
            self.platform_config.market_proposal_fee = fee;
        }

        Ok(())
    }
}
