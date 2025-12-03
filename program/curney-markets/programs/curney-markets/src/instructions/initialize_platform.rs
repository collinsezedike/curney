use anchor_lang::prelude::*;

use crate::constants::PLATFORM_CONFIG_SEED;
use crate::state::PlatformConfig;

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer=admin,
        seeds = [PLATFORM_CONFIG_SEED, admin.key().as_ref()],
        space = 8 + PlatformConfig::INIT_SPACE,
        bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

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
        self.platform_config.set_inner(PlatformConfig {
            bump: bumps.platform_config,
            creator_fee_bps,
            platform_fee_bps,
            market_proposal_fee,
            admin: self.admin.key(),
        });
        Ok(())
    }
}
