use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{
    MARKET_CONFIG_SEED, MARKET_STATE_SEED, MARKET_VAULT_SEED, PLATFORM_CONFIG_SEED,
};
use crate::error::MarketError;
use crate::state::{MarketConfig, MarketState, PlatformConfig};

#[derive(Accounts)]
pub struct WithdrawCreatorRevenue<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        seeds = [PLATFORM_CONFIG_SEED, platform_config.admin.key().as_ref()],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    #[account(
        seeds = [MARKET_CONFIG_SEED, market_config.market_id.to_le_bytes().as_ref(), platform_config.key().as_ref()],
        bump = market_config.bump,
    )]
    pub market_config: Account<'info, MarketConfig>,

    #[account(
        mut,
        seeds = [MARKET_STATE_SEED, market_config.key().as_ref(), platform_config.key().as_ref()],
        bump = market_state.bump,
    )]
    pub market_state: Account<'info, MarketState>,

    #[account(mut, seeds = [MARKET_VAULT_SEED, market_config.key().as_ref()], bump = market_config.vault_bump)]
    pub market_vault: SystemAccount<'info>,

    pub rent: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,
}

impl<'info> WithdrawCreatorRevenue<'info> {
    pub fn withdraw_creator_revenue(&mut self) -> Result<()> {
        require!(
            self.creator.key() == self.market_config.creator,
            MarketError::Unauthorized
        );

        require!(
            self.market_state.is_resolved,
            MarketError::MarketNotResolved
        );

        let required_rent_reserve = self.rent.minimum_balance(self.market_vault.data_len());

        let available_for_withdrawal = self
            .market_vault
            .lamports()
            .saturating_sub(required_rent_reserve);

        let amount_to_transfer = self
            .market_state
            .creator_fee_revenue
            .min(available_for_withdrawal);

        require!(amount_to_transfer > 0, MarketError::NothingToWithdraw);

        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.market_vault.to_account_info(),
            to: self.creator.to_account_info(),
        };

        let seeds = &[
            MARKET_VAULT_SEED,
            self.market_config.to_account_info().key.as_ref(),
            &[self.market_config.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer(cpi_ctx, amount_to_transfer)?;

        self.market_state.creator_fee_revenue = 0;

        Ok(())
    }
}
