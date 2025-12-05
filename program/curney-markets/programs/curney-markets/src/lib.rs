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

    pub fn propose_market(
        ctx: Context<ProposeMarket>,
        market_id: u64,
        start_time: i64,
        end_time: i64,
        min_prediction_price: u64,
        question: String,
        description: String,
    ) -> Result<()> {
        ctx.accounts.propose_market(
            market_id,
            start_time,
            end_time,
            min_prediction_price,
            question,
            description,
            &ctx.bumps,
        )
    }

    pub fn update_market_config(
        ctx: Context<UpdateMarketConfig>,
        start_time: Option<i64>,
        end_time: Option<i64>,
        min_prediction_price: Option<u64>,
        question: Option<String>,
        description: Option<String>,
    ) -> Result<()> {
        ctx.accounts.update_market_config(
            start_time,
            end_time,
            min_prediction_price,
            question,
            description,
        )
    }

    pub fn approve_market(ctx: Context<ApproveMarket>) -> Result<()> {
        ctx.accounts.approve_market()
    }

    pub fn place_prediction(
        ctx: Context<PlacePrediction>,
        prediction: i64,
        stake_amount: u64,
    ) -> Result<()> {
        ctx.accounts
            .place_prediction(prediction, stake_amount, &ctx.bumps)
    }
}
