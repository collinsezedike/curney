use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{PLATFORM_CONFIG_SEED, PLATFORM_TREASURY_SEED};
use crate::error::PlatformError;
use crate::state::PlatformConfig;

#[derive(Accounts)]
pub struct WithdrawPlatformFees<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [PLATFORM_CONFIG_SEED, admin.key().as_ref()],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    #[account(
        mut,
        seeds = [PLATFORM_TREASURY_SEED, platform_config.key().as_ref()],
        bump = platform_config.treasury_bump
    )]
    pub platform_treasury: SystemAccount<'info>,

    pub rent: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,
}

impl<'info> WithdrawPlatformFees<'info> {
    pub fn withdraw_platform_fees(&mut self) -> Result<()> {
        require!(
            self.admin.key() == self.platform_config.admin,
            PlatformError::Unauthorized
        );

        let required_rent_reserve = self.rent.minimum_balance(self.platform_treasury.data_len());

        let withdrawal_amount = self
            .platform_treasury
            .lamports()
            .saturating_sub(required_rent_reserve);

        require!(withdrawal_amount > 0, PlatformError::NothingToWithdraw);

        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.platform_treasury.to_account_info(),
            to: self.admin.to_account_info(),
        };

        let seeds: &[&[u8]] = &[
            PLATFORM_TREASURY_SEED,
            self.platform_config.to_account_info().key.as_ref(),
            &[self.platform_config.treasury_bump],
        ];
        let signer_seeds = &[seeds];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer(cpi_ctx, withdrawal_amount)?;

        Ok(())
    }
}
