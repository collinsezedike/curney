use anchor_lang::prelude::*;

#[error_code]
pub enum PlatformError {
    #[msg("Creator fee BPS must be <= 10,000")]
    InvalidCreatorFeeBps,

    #[msg("Platform fee BPS must be <= 10,000")]
    InvalidPlatformFeeBps,

    #[msg("Total fee BPS must not exceed 10,000")]
    TotalFeeTooHigh,

    #[msg("Market proposal fee must be greater than zero")]
    InvalidMarketProposalFee,

    #[msg("You are not authorized to perform this action")]
    Unauthorized,

    #[msg("Platform treasury has no funds to withdraw")]
    NothingToWithdraw,
}

#[error_code]
pub enum MarketError {
    #[msg("Start time must be in the future")]
    StartTimeInPast,

    #[msg("End time must be after the start time")]
    InvalidEndTime,

    #[msg("Question exceeds maximum allowed length")]
    QuestionTooLong,

    #[msg("Resolution spec exceeds maximum allowed length")]
    DescriptionTooLong,

    #[msg("Minimum prediction price must be greater than zero")]
    MinPredictionPriceZero,

    #[msg("Creator account specified is not the market creator")]
    InvalidCreator,

    #[msg("Market proposal fee not configured")]
    MissingProposalFee,

    #[msg("Platform treasury has no funds to withdraw")]
    NothingToWithdraw,

    #[msg("Market ID already exists or invalid PDA seeds")]
    MarketAlreadyExists,

    #[msg("You are not authorized to perform this action")]
    Unauthorized,

    #[msg("Market has already been resolved and cannot be modified")]
    MarketAlreadyResolved,

    #[msg("Market has not been resolved yet")]
    MarketNotResolved,

    #[msg("Market has already been approved and cannot be modified")]
    MarketAlreadyApproved,

    #[msg("Market has not been approved and cannot accept predictions")]
    MarketNotApproved,

    #[msg("Market has not started")]
    MarketNotStarted,

    #[msg("Market has ended")]
    MarketEnded,

    #[msg("Market has not ended yet")]
    MarketNotEnded,

    #[msg("Stake amount is below the minimum allowed")]
    StakeTooLow,

    #[msg("Math overflow occurred")]
    MathOverflow,
}

#[error_code]
pub enum PositionError {
    #[msg("Position reward already claimed")]
    RewardAlreadyClaimed,

    #[msg("The decay factor must be greater than zero")]
    InvalidDecay,
}
