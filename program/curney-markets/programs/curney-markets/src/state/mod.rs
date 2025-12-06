use anchor_lang::prelude::*;

use crate::constants::{MARKET_DESCRIPTION_MAX_LEN, MARKET_QUESTION_MAX_LEN};

#[account]
#[derive(InitSpace)]
pub struct PlatformConfig {
    pub bump: u8,
    pub treasury_bump: u8,
    pub creator_fee_bps: u16,
    pub platform_fee_bps: u16,
    pub market_proposal_fee: u64,
    pub admin: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct MarketConfig {
    pub bump: u8,
    pub vault_bump: u8,
    pub market_id: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub min_prediction_price: u64,
    #[max_len(MARKET_QUESTION_MAX_LEN)]
    pub question: String,
    #[max_len(MARKET_DESCRIPTION_MAX_LEN)]
    pub description: String,
    pub creator: Pubkey,
    pub market_state: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct MarketState {
    pub bump: u8,
    pub decay: u64,
    pub is_approved: bool,
    pub is_resolved: bool,
    pub resolution: Option<i64>,
    pub total_pool: u64,
    pub total_positions: u64,
    pub total_scores: Option<u128>,
    pub creator_fee_revenue: u64,
    pub market_config: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct Position {
    pub claimed: bool,
    pub bump: u8,
    pub stake: u64,
    pub decay: u64,
    pub index: u64,
    pub reward: Option<u64>,
    pub timestamp: i64,
    pub prediction: i64,
    pub user: Pubkey,
    pub market: Pubkey,
}
