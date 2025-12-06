use anchor_lang::prelude::*;

use crate::constants::{BASIS_POINT_SCALE, PLATFORM_CONFIG_SEED, PLATFORM_TREASURY_SEED};
use crate::error::PlatformError;
use crate::state::PlatformConfig;

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [PLATFORM_CONFIG_SEED, admin.key().as_ref()],
        space = 8 + PlatformConfig::INIT_SPACE,
        bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    #[account(seeds = [PLATFORM_TREASURY_SEED, platform_config.key().as_ref()], bump)]
    pub platform_treasury: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializePlatform<'info> {
    pub fn initialize_platform(
        &mut self,
        creator_fee_bps: u16,
        platform_fee_bps: u16,
        market_proposal_fee: u64,
        bumps: &InitializePlatformBumps,
    ) -> Result<()> {
        require!(
            creator_fee_bps <= BASIS_POINT_SCALE,
            PlatformError::InvalidCreatorFeeBps
        );

        require!(
            platform_fee_bps <= BASIS_POINT_SCALE,
            PlatformError::InvalidPlatformFeeBps
        );

        require!(
            (creator_fee_bps + platform_fee_bps) <= BASIS_POINT_SCALE,
            PlatformError::TotalFeeTooHigh
        );

        require!(
            market_proposal_fee > 0,
            PlatformError::InvalidMarketProposalFee
        );

        self.platform_config.set_inner(PlatformConfig {
            bump: bumps.platform_config,
            treasury_bump: bumps.platform_treasury,
            creator_fee_bps,
            platform_fee_bps,
            market_proposal_fee,
            admin: self.admin.key(),
        });
        Ok(())
    }
}
