use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{
    MARKET_CONFIG_SEED, MARKET_STATE_SEED, MARKET_VAULT_SEED, PLATFORM_CONFIG_SEED,
    PLATFORM_TREASURY_SEED,
};
use crate::error::MarketError;
use crate::state::{MarketConfig, MarketState, PlatformConfig};

#[derive(Accounts)]
pub struct DismissMarket<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: This is the market creator and is validated in the instruction handler
    #[account(mut)]
    pub creator: UncheckedAccount<'info>,

    #[account(
        seeds = [PLATFORM_CONFIG_SEED, admin.key().as_ref()],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    #[account(mut, seeds = [PLATFORM_TREASURY_SEED, platform_config.key().as_ref()], bump = platform_config.treasury_bump)]
    pub platform_treasury: SystemAccount<'info>,

    #[account(
        mut,
        close = creator,
        seeds = [MARKET_CONFIG_SEED, market_config.market_id.to_le_bytes().as_ref(), platform_config.key().as_ref()],
        bump = market_config.bump,
    )]
    pub market_config: Account<'info, MarketConfig>,

    #[account(
        mut,
        close = creator,
        seeds = [MARKET_STATE_SEED, market_config.key().as_ref(), platform_config.key().as_ref()],
        bump = market_state.bump,
    )]
    pub market_state: Account<'info, MarketState>,

    #[account(mut, seeds = [MARKET_VAULT_SEED, market_config.key().as_ref()], bump = market_config.vault_bump)]
    pub market_vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> DismissMarket<'info> {
    pub fn dismiss_market(&mut self) -> Result<()> {
        require!(
            self.admin.key() == self.platform_config.admin,
            MarketError::Unauthorized
        );

        require!(
            !self.market_state.is_approved,
            MarketError::MarketAlreadyApproved
        );

        require!(
            !self.market_state.is_resolved,
            MarketError::MarketAlreadyResolved
        );

        require!(
            self.creator.key() == self.market_config.creator,
            MarketError::InvalidCreator
        );

        // Refund the creator half the market proposal fee
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.platform_treasury.to_account_info(),
            to: self.creator.to_account_info(),
        };

        let seeds = &[
            PLATFORM_TREASURY_SEED,
            self.platform_config.to_account_info().key.as_ref(),
            &[self.platform_config.treasury_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer(cpi_ctx, self.platform_config.market_proposal_fee / 2)?;

        // Empty the market vault and close the account
        let rent = self.market_vault.to_account_info().lamports();
        self.creator.add_lamports(rent)?;
        self.market_vault.sub_lamports(rent)?;
        let mut data = self.market_vault.try_borrow_mut_data()?;
        for byte in data.iter_mut() {
            *byte = 0;
        }
        self.market_vault
            .to_account_info()
            .assign(&self.system_program.key());

        Ok(())
    }
}
