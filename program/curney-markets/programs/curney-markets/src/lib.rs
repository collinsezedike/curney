pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("HDowPKaGVPenpmncAMK5amt1i6XR8GteGSBNscbMLKcW");

#[program]
pub mod curney_markets {
    use super::*;

    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        creator_fee_bps: u16,
        platform_fee_bps: u16,
        market_proposal_fee: u64,
    ) -> Result<()> {
        ctx.accounts.initialize_platform(
            creator_fee_bps,
            platform_fee_bps,
            market_proposal_fee,
            &ctx.bumps,
        )
    }
}
