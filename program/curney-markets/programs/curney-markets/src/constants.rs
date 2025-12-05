use anchor_lang::prelude::*;

#[constant]
pub const PLATFORM_CONFIG_SEED: &[u8] = b"platform-config";

#[constant]
pub const PLATFORM_TREASURY_SEED: &[u8] = b"platform-treasury";

#[constant]
pub const MARKET_CONFIG_SEED: &[u8] = b"market-config";

#[constant]
pub const MARKET_STATE_SEED: &[u8] = b"market-state";

#[constant]
pub const MARKET_VAULT_SEED: &[u8] = b"market-vault";

#[constant]
pub const POSITION_SEED: &[u8] = b"position";

pub const MARKET_QUESTION_MAX_LEN: usize = 256;

pub const MARKET_DESCRIPTION_MAX_LEN: usize = 1024;
