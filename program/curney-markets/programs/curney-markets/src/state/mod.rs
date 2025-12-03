use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PlatformConfig {
    pub bump: u8,
    pub creator_fee_bps: u16,
    pub platform_fee_bps: u16,
    pub market_proposal_fee: u64,
    pub admin: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub bump: u8,
    pub start_time: i64,
    pub is_approved: bool,
    pub is_resolved: bool,
    pub resolution: Option<i64>,
    pub total_pool: u64,
    pub total_positions: u64,
    pub min_prediction_price: u64,
    pub end_time: i64,
    #[max_len(64)]
    pub question: String,
    #[max_len(64)]
    pub description: String,
    pub creator: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct Position {
    pub bump: u8,
    pub user: Pubkey,
    pub market: Pubkey,
    pub prediction: i64,
    pub stake: u64,
    pub decay: u64,
    pub reward: u64,
    pub claimed: bool,
    pub timestamp: i64,
}
