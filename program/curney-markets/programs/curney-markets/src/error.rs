use anchor_lang::prelude::*;

#[error_code]
pub enum PlatformError {
    #[msg("Creator fee BPS must be <= 10,000.")]
    InvalidCreatorFeeBps,

    #[msg("Platform fee BPS must be <= 10,000.")]
    InvalidPlatformFeeBps,

    #[msg("Total fee BPS must not exceed 10,000.")]
    TotalFeeTooHigh,

    #[msg("Market proposal fee must be greater than zero.")]
    InvalidMarketProposalFee,
}

#[error_code]
pub enum MarketError {
    #[msg("Start time must be in the future.")]
    StartTimeInPast,

    #[msg("End time must be after the start time.")]
    InvalidEndTime,

    #[msg("Question exceeds maximum allowed length.")]
    QuestionTooLong,

    #[msg("Resolution spec exceeds maximum allowed length.")]
    DescriptionTooLong,

    #[msg("Minimum prediction price must be greater than zero.")]
    MinPredictionPriceZero,

    #[msg("Creator is not authorized to propose markets.")]
    UnauthorizedCreator,

    #[msg("Market proposal fee not configured.")]
    MissingProposalFee,

    #[msg("Market ID already exists or invalid PDA seeds.")]
    MarketAlreadyExists,
}
