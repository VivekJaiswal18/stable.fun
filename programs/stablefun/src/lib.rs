// use anchor_lang::prelude::*;
// use anchor_spl::token_2022::{self, Token2022, Mint, TokenAccount};
// use anchor_spl::Token{Mint, TokenAccount};
// // use anchor_spl::token_2022::{self, Token2022, Mint, TokenAccount};
// use anchor_spl::token_2022::spl_token_2022::extension::interest_bearing_mint::InterestBearingConfig;
// use switchboard_v2::AggregatorAccountData;
// use solana_program::account_info::AccountInfo;

// use anchor_lang::prelude::*;
// use anchor_spl::{
//     token_2022::{self, Token2022, Mint, TokenAccount},
//     associated_token::AssociatedToken,
// };
// use std::str::FromStr;
// use switchboard_v2::{AggregatorAccountData, SwitchboardDecimal};
// use spl_token_2022::extension::interest_bearing_mint::InterestBearingConfig; last

//[ use anchor_lang::prelude::*; 15
// use anchor_spl::token_2022::{self, Token2022};
// use anchor_spl::token::Mint; 
// use anchor_spl::token::TokenAccount;
// use switchboard_solana::{AggregatorAccountData, SwitchboardDecimal};
// // use spl_token_2022::extension::interest_bearing_mint::InterestBearingConfig;
// // use spl_token_2022::extension::StateWithExtensions;
// // use spl_token_2022::{
// //     extension::{ExtensionType, interest_bearing_mint::InterestBearingConfig, StateWithExtensions}
// // }; recent
// use spl_token_2022::{
//     extension::{ExtensionType, interest_bearing_mint::InterestBearingConfig, StateWithExtensions}
// }; //added
use spl_token_2022::extension::BaseStateWithExtensions;
// // use spl_token_2022::state::{Mint as Token2022Mint, StateWithExtensions};recent
// use std::str::FromStr; //] 15

// Anchor dependencies
use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Token2022};
use anchor_spl::token::Mint;
use anchor_spl::token::TokenAccount;

// Switchboard dependencies
use switchboard_solana::{AggregatorAccountData, SwitchboardDecimal};

// Standard library
use std::str::FromStr;

// spl-token-2022 dependencies
use spl_token_2022::state::Mint as Token2022Mint;
use spl_token_2022::{
         extension::{ExtensionType, interest_bearing_mint::InterestBearingConfig, StateWithExtensions}
     };
// use spl_token_2022::extension::InterestBearingConfig;
// use spl_token::state::{Extension, StateWithExtensions};



declare_id!("3HhEASEoXMK8q3Xnch8fjyBdq9qp3JZnE8biEZcmKshj");
const MAX_NAME_LENGTH: usize = 32;
const MAX_SYMBOL_LENGTH: usize = 8;
const MAX_ICON_URL_LENGTH: usize = 128;
const MAX_CURRENCY_LENGTH: usize = 16;
const MAX_ORACLE_STALENESS: i64 = 300;
const ORACLE_FEEDS: &[(&str, &str)] = &[
("USD", "Frkcq8bWREur6hRrtGZidPDn1P3Byi8fjbJxfiJvRWFB"),
("EUR", "7Eg6PFHteYGPr4PwpcDVibFtAihuzyB5BgqYK4DB8u3Q"),
("MXN", "Frkcq8bWREur6hRrtGZidPDn1P3Byi8fjbJxfiJvRWFB"),
];
#[program]
pub mod stablefun {
use super::*;
pub fn create_stablecoin(
ctx: Context<CreateStablecoin>,
name: String,
symbol: String,
decimals: u8,
icon_url: String,
target_currency: String,
) -> Result<()> {
require!(decimals <= 9, ErrorCode::InvalidDecimals);
require!(!name.is_empty() && name.len() <= MAX_NAME_LENGTH, ErrorCode::InvalidName);
require!(!symbol.is_empty() && symbol.len() <= MAX_SYMBOL_LENGTH, ErrorCode::InvalidSymbol);
require!(!icon_url.is_empty() && icon_url.len() <= MAX_ICON_URL_LENGTH, ErrorCode::InvalidIconUrl);
require!(!target_currency.is_empty() && target_currency.len() <= MAX_CURRENCY_LENGTH, ErrorCode::InvalidCurrency);
require!(ctx.accounts.stablebond_mint.is_initialized, ErrorCode::InvalidStablebondMint);
let stablecoin = &mut ctx.accounts.stablecoin_data;
stablecoin.creator = ctx.accounts.creator.key();
stablecoin.stablebond_mint = ctx.accounts.stablebond_mint.key();
// stablecoin.name = name; 31
// stablecoin.symbol = symbol; 31
stablecoin.name = name.clone(); //31
stablecoin.symbol = symbol.clone(); //31
stablecoin.icon_url = icon_url;
// stablecoin.target_currency = target_currency; //31
stablecoin.target_currency = target_currency.clone(); //31
stablecoin.decimals = decimals;
stablecoin.total_supply = 0;
stablecoin.total_stablebonds = 0;
stablecoin.oracle = get_oracle_feed(&target_currency)?;
stablecoin.creation_time = Clock::get()?.unix_timestamp;
emit!(StablecoinCreated {
creator: ctx.accounts.creator.key(),
mint: ctx.accounts.stablecoin_mint.key(),
// name: name.clone(), 31
// symbol: symbol.clone(),31
// target_currency: target_currency.clone(),31
name,
symbol,
target_currency,
});
Ok(())
}
pub fn mint_tokens(
ctx: Context<MintTokens>,
stablebond_amount: u64,
minimum_tokens_out: u64,
) -> Result<()> {
let oracle_feed = &ctx.accounts.oracle_feed.load()?;
require!(!is_oracle_stale(oracle_feed)?, ErrorCode::StaleOracle);
// Calculate current value including accrued interest
let current_value = get_token_current_value(
&ctx.accounts.stablebond_mint.to_account_info(),
stablebond_amount,
)?;
let price = oracle_feed.latest_confirmed_round.result;
let exchange_rate = (price.mantissa as f64) * 10f64.powi(price.scale as i32);
let token_amount = (current_value as f64 * exchange_rate) as u64;
require!(token_amount >= minimum_tokens_out, ErrorCode::SlippageExceeded);
token_2022::transfer_checked(
CpiContext::new(
ctx.accounts.token_program.to_account_info(),
token_2022::TransferChecked {
from: ctx.accounts.user_stablebond_account.to_account_info(),
mint: ctx.accounts.stablebond_mint.to_account_info(),
to: ctx.accounts.program_stablebond_account.to_account_info(),
authority: ctx.accounts.user.to_account_info(),
},
),
stablebond_amount,
ctx.accounts.stablebond_mint.decimals,
)?;
token_2022::mint_to(
CpiContext::new(
ctx.accounts.token_program.to_account_info(),
token_2022::MintTo {
mint: ctx.accounts.stablecoin_mint.to_account_info(),
to: ctx.accounts.user_token_account.to_account_info(),
authority: ctx.accounts.creator.to_account_info(),
},
),
token_amount,
)?;
let stablecoin = &mut ctx.accounts.stablecoin_data;
stablecoin.total_supply = stablecoin.total_supply
.checked_add(token_amount)
.ok_or(ErrorCode::CalculationOverflow)?;
stablecoin.total_stablebonds = stablecoin.total_stablebonds
.checked_add(stablebond_amount)
.ok_or(ErrorCode::CalculationOverflow)?;
emit!(TokensMinted {
user: ctx.accounts.user.key(),
amount: token_amount,
stablebond_amount,
});
Ok(())
}
pub fn redeem_tokens(
ctx: Context<RedeemTokens>,
token_amount: u64,
minimum_stablebonds_out: u64,
) -> Result<()> {
let oracle_feed = &ctx.accounts.oracle_feed.load()?;
require!(!is_oracle_stale(oracle_feed)?, ErrorCode::StaleOracle);
let price = oracle_feed.latest_confirmed_round.result;
let exchange_rate = (price.mantissa as f64) * 10f64.powi(price.scale as i32);
// Calculate stablebond amount considering current value
let stablebond_amount = calculate_stablebond_amount(
token_amount,
exchange_rate,
&ctx.accounts.stablebond_mint.to_account_info(),
)?;
require!(stablebond_amount >= minimum_stablebonds_out, ErrorCode::SlippageExceeded);
token_2022::burn(
CpiContext::new(
ctx.accounts.token_program.to_account_info(),
token_2022::Burn {
mint: ctx.accounts.stablecoin_mint.to_account_info(),
from: ctx.accounts.user_token_account.to_account_info(),
authority: ctx.accounts.user.to_account_info(),
},
),
token_amount,
)?;
token_2022::transfer_checked(
CpiContext::new(
ctx.accounts.token_program.to_account_info(),
token_2022::TransferChecked {
from: ctx.accounts.program_stablebond_account.to_account_info(),
mint: ctx.accounts.stablebond_mint.to_account_info(),
to: ctx.accounts.user_stablebond_account.to_account_info(),
authority: ctx.accounts.creator.to_account_info(),
},
),
stablebond_amount,
ctx.accounts.stablebond_mint.decimals,
)?;
let stablecoin = &mut ctx.accounts.stablecoin_data;
stablecoin.total_supply = stablecoin.total_supply
.checked_sub(token_amount)
.ok_or(ErrorCode::CalculationOverflow)?;
stablecoin.total_stablebonds = stablecoin.total_stablebonds
.checked_sub(stablebond_amount)
.ok_or(ErrorCode::CalculationOverflow)?;
emit!(TokensRedeemed {
user: ctx.accounts.user.key(),
amount: token_amount,
stablebond_amount,
});
Ok(())
}
// pub fn get_yield_info(ctx: Context<GetYieldInfo>, amount: u64) -> Result<YieldInfo> {
// let mint_info = ctx.accounts.stablebond_mint.to_account_info();
// let interest_config = InterestBearingConfig::unpack_from_slice(&mint_info.data.borrow())?;
// let rate = interest_config.rate as f64 / (u64::MAX as f64);
// let compounds_per_year = 365.0_f64 * 24.0;
// let apy = ((1.0_f64 + rate / compounds_per_year).powf(compounds_per_year) - 1.0) * 100.0;
// let current_ts = Clock::get()?.unix_timestamp;
// let initial_ts = interest_config.initialization_timestamp;
// let time_elapsed = current_ts.saturating_sub(initial_ts) as f64;
// let current_value = amount as f64 *
// (1.0_f64 + rate).powf(time_elapsed / (365.0_f64 * 24.0 * 60.0 * 60.0));
// let earned_yield = (current_value - amount as f64) as u64;
// Ok(YieldInfo {
// apy,
// total_value: current_value as u64,
// initial_deposit: amount,
// earned_yield,
// })
// }  recent
// pub fn get_yield_info(ctx: Context<GetYieldInfo>, amount: u64) -> Result<YieldInfo> { 31
//     let mint_info = ctx.accounts.stablebond_mint.to_account_info();
//     let (interest_config, rate) = get_interest_config_and_rate(&mint_info)?;
//     let compounds_per_year = 365.0_f64 * 24.0;

//     let apy = ((1.0_f64 + rate / compounds_per_year).powf(compounds_per_year) - 1.0) * 100.0;
//     // let time_elapsed = get_time_elapsed(interest_config.initialization_timestamp)?; //recent
//     let initialization_timestamp: i64 = interest_config.initialization_timestamp.into(); //added
// let time_elapsed = get_time_elapsed(initialization_timestamp)?; //added
//     let current_value = amount as f64 * (1.0_f64 + rate).powf(time_elapsed / (365.0 * 24.0 * 60.0 * 60.0));
//     let earned_yield = (current_value - amount as f64) as u64;

//     Ok(YieldInfo {
//         apy,
//         total_value: current_value as u64,
//         initial_deposit: amount,
//         earned_yield,
//     })
// } //added 31
pub fn get_yield_info(ctx: Context<GetYieldInfo>, amount: u64) -> Result<YieldInfo> {
    let mint_info = ctx.accounts.stablebond_mint.to_account_info();
    let (interest_config, rate) = get_interest_config_and_rate(&mint_info)?;
    let compounds_per_year = 365.0_f64 * 24.0;

    let apy = ((1.0_f64 + rate / compounds_per_year).powf(compounds_per_year) - 1.0) * 100.0;
    let initialization_timestamp: i64 = interest_config.initialization_timestamp.into();
    let time_elapsed = get_time_elapsed(initialization_timestamp)?;
    let current_value = amount as f64 * (1.0_f64 + rate).powf(time_elapsed / (365.0 * 24.0 * 60.0 * 60.0));
    let earned_yield = (current_value - amount as f64) as u64;

    Ok(YieldInfo {
        apy,
        total_value: current_value as u64,
        initial_deposit: amount,
        earned_yield,
    })
}
}
#[derive(Accounts)]
pub struct GetYieldInfo<'info> {
pub stablebond_mint: Account<'info, Mint>,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct YieldInfo {
pub apy: f64,
pub total_value: u64,
pub initial_deposit: u64,
pub earned_yield: u64,
}
#[derive(Accounts)]
#[instruction(name: String, symbol: String, decimals: u8, icon_url: String, target_currency: String)]
pub struct CreateStablecoin<'info> {
#[account(mut)]
pub creator: Signer<'info>,
#[account(
init,
payer = creator,
space = StablecoinData::SIZE
)]
pub stablecoin_data: Account<'info, StablecoinData>,
#[account(
init,
payer = creator,
mint::decimals = decimals,
mint::authority = creator.key(),
)]
pub stablecoin_mint: Account<'info, Mint>,
pub stablebond_mint: Account<'info, Mint>,
pub token_program: Program<'info, Token2022>,
pub system_program: Program<'info, System>,
pub rent: Sysvar<'info, Rent>,
}
#[derive(Accounts)]
pub struct MintTokens<'info> {
#[account(mut)]
pub user: Signer<'info>,
// pub creator: AccountInfo<'info>, recent
pub creator: UncheckedAccount<'info>,
#[account(mut)]
pub stablecoin_data: Account<'info, StablecoinData>,
#[account(mut)]
pub stablecoin_mint: Account<'info, Mint>,
#[account(mut)]
pub stablebond_mint: Account<'info, Mint>,
#[account(
mut,
constraint = user_token_account.owner == user.key(),
constraint = user_token_account.mint == stablecoin_mint.key()
)]
pub user_token_account: Account<'info, TokenAccount>,
#[account(
mut,
constraint = user_stablebond_account.owner == user.key(),
constraint = user_stablebond_account.mint == stablecoin_data.stablebond_mint
)]
pub user_stablebond_account: Account<'info, TokenAccount>,
#[account(mut)]
pub program_stablebond_account: Account<'info, TokenAccount>,
#[account(
constraint = oracle_feed.key() == stablecoin_data.oracle
)]
pub oracle_feed: AccountLoader<'info, AggregatorAccountData>,
pub token_program: Program<'info, Token2022>,
}
#[derive(Accounts)]
pub struct RedeemTokens<'info> {
#[account(mut)]
pub user: Signer<'info>,
pub creator: AccountInfo<'info>,
#[account(mut)]
pub stablecoin_data: Account<'info, StablecoinData>,
#[account(mut)]
pub stablecoin_mint: Account<'info, Mint>,
#[account(mut)]
pub stablebond_mint: Account<'info, Mint>,
#[account(mut)]
pub user_stablebond_account: Account<'info, TokenAccount>,
#[account(mut)]
pub program_stablebond_account: Account<'info, TokenAccount>,
#[account(mut)]
pub user_token_account: Account<'info, TokenAccount>,
pub oracle_feed: AccountLoader<'info, AggregatorAccountData>,
pub token_program: Program<'info, Token2022>,
}
#[account]
pub struct StablecoinData {
pub creator: Pubkey,
pub stablebond_mint: Pubkey,
pub oracle: Pubkey,
pub name: String,
pub symbol: String,
pub icon_url: String,
pub target_currency: String,
pub decimals: u8,
pub total_supply: u64,
pub total_stablebonds: u64,
pub creation_time: i64,
}
impl StablecoinData {
pub const SIZE: usize = 8 +  // discriminator
32 +  // creator
32 +  // stablebond_mint
32 +  // oracle
4 + MAX_NAME_LENGTH +  // name
4 + MAX_SYMBOL_LENGTH +  // symbol
4 + MAX_ICON_URL_LENGTH +  // icon_url
4 + MAX_CURRENCY_LENGTH +  // target_currency
1 +  // decimals
8 +  // total_supply
8 +  // total_stablebonds
8;   // creation_time
}
// Helper Functions
fn get_oracle_feed(currency: &str) -> Result<Pubkey> {
for &(curr, feed) in ORACLE_FEEDS {
if curr == currency {
return Ok(Pubkey::from_str(feed).unwrap());
}
}
Err(error!(ErrorCode::InvalidCurrency))
}
fn is_oracle_stale(oracle_data: &AggregatorAccountData) -> Result<bool> {
let staleness = Clock::get()?.unix_timestamp - oracle_data.latest_confirmed_round.round_open_timestamp;
Ok(staleness > MAX_ORACLE_STALENESS)
}
// fn get_token_current_value(mint_info: &AccountInfo, amount: u64) -> Result<u64> {
// let interest_config = InterestBearingConfig::unpack_from_slice(&mint_info.data.borrow())?;
// let rate = interest_config.rate as f64 / (u64::MAX as f64);
// let current_ts = Clock::get()?.unix_timestamp;
// let initial_ts = interest_config.initialization_timestamp;
// let time_elapsed = current_ts.saturating_sub(initial_ts) as f64;
// let current_value = amount as f64 *
// (1.0_f64 + rate).powf(time_elapsed / (365.0_f64 * 24.0 * 60.0 * 60.0));
// Ok(current_value as u64)
// } recent
// fn get_token_current_value(mint_info: &AccountInfo, amount: u64) -> Result<u64> {    31
//     let (interest_config, rate) = get_interest_config_and_rate(mint_info)?;
//     // let time_elapsed = get_time_elapsed(interest_config.initialization_timestamp)?; recent
//     let initialization_timestamp: i64 = interest_config.initialization_timestamp.into(); //added
// let time_elapsed = get_time_elapsed(initialization_timestamp)?; //added
//     let current_value = amount as f64 * (1.0_f64 + rate).powf(time_elapsed / (365.0 * 24.0 * 60.0 * 60.0));
//     Ok(current_value as u64)
// } //added 31
fn get_token_current_value(mint_info: &AccountInfo, amount: u64) -> Result<u64> {
    let (interest_config, rate) = get_interest_config_and_rate(mint_info)?;
    let initialization_timestamp: i64 = interest_config.initialization_timestamp.into();
    let time_elapsed = get_time_elapsed(initialization_timestamp)?;
    let current_value = amount as f64 * (1.0_f64 + rate).powf(time_elapsed / (365.0 * 24.0 * 60.0 * 60.0));
    Ok(current_value as u64)
}
fn get_time_elapsed(initial_ts: i64) -> Result<f64> { //added
    let current_ts = Clock::get()?.unix_timestamp;
    let time_elapsed = current_ts.saturating_sub(initial_ts) as f64;
    Ok(time_elapsed)
}
fn get_interest_config_and_rate(mint_info: &AccountInfo) -> Result<(InterestBearingConfig, f64)> { //added
    // let interest_config = InterestBearingConfig::unpack_from_slice(&mint_info.data.borrow())?;
    // let state_with_extensions = StateWithExtensions::<Mint>::unpack(&mint_info.data.borrow())?; //recent
    let data_ref = mint_info.data.borrow(); //31
    // let state_with_extensions = StateWithExtensions::<Token2022Mint>::unpack(&mint_info.data.borrow())?;//adde 31
    let state_with_extensions = StateWithExtensions::<Token2022Mint>::unpack(&data_ref)?;
    let interest_config = state_with_extensions.get_extension::<InterestBearingConfig>()?;
//below added 31
    // let owned_config = InterestBearingConfig {
    //     rate: interest_config.rate,
    //     initialization_timestamp: interest_config.initialization_timestamp,
    //     rate_authority: interest_config.rate_authority,
    // };
    // let rate = interest_config.rate as f64 / (u64::MAX as f64); last
    // let rate = owned_config.rate as f64 / (u64::MAX as f64); //31
    // let rate = interest_config.rate as f64 / (u64::MAX as f64);
    // Ok((interest_config, rate)) last
    let owned_config = InterestBearingConfig {
        current_rate: interest_config.current_rate,
        initialization_timestamp: interest_config.initialization_timestamp,
        rate_authority: interest_config.rate_authority,
        last_update_timestamp: interest_config.last_update_timestamp,
        pre_update_average_rate: interest_config.pre_update_average_rate
    };
    
    // Convert PodI16 to f64 using its value directly
    let rate = i16::from(interest_config.current_rate) as f64 / (i16::MAX as f64);
    Ok((owned_config, rate))
}
// fn get_interest_config_and_rate(mint_info: &AccountInfo) -> Result<(InterestBearingConfig, f64)> {
//     let mint_data = mint_info.data.borrow();
//     let state_with_extensions = StateWithExtensions::<Token2022Mint>::unpack(&mint_data)?;

//     let mut current_offset = Token2022Mint::LEN;

//     for extension_type in state_with_extensions.get_extension_types()? {
//         if extension_type == ExtensionType::InterestBearingConfig {
//             let interest_config_data = &mint_data[current_offset..current_offset + InterestBearingConfig::LEN];
//             let interest_config = InterestBearingConfig::unpack(interest_config_data)?;

//             let rate = interest_config.rate as f64 / (u64::MAX as f64);
//             return Ok((interest_config, rate));
//         }
//         current_offset += extension_type.get_length().unwrap_or(0);
//     }

//     Err(ProgramError::InvalidAccountData) // InterestBearingConfig not found
// }
// fn calculate_stablebond_amount(
// token_amount: u64,
// exchange_rate: f64,
// mint_info: &AccountInfo,
// ) -> Result<u64> {
// let interest_config = InterestBearingConfig::unpack_from_slice(&mint_info.data.borrow())?;
// let rate = interest_config.rate as f64 / (u64::MAX as f64);
// let current_ts = Clock::get()?.unix_timestamp;
// let initial_ts = interest_config.initialization_timestamp;
// let time_elapsed = current_ts.saturating_sub(initial_ts) as f64;
// let base_amount = token_amount as f64 / exchange_rate;
// let stablebond_amount = base_amount /
// (1.0_f64 + rate).powf(time_elapsed / (365.0_f64 * 24.0 * 60.0 * 60.0));
// Ok(stablebond_amount as u64)
// } recent
// fn calculate_stablebond_amount( 31
//     token_amount: u64,
//     exchange_rate: f64,
//     mint_info: &AccountInfo,
// ) -> Result<u64> {
//     let (interest_config, rate) = get_interest_config_and_rate(mint_info)?;
//     // let time_elapsed = get_time_elapsed(interest_config.initialization_timestamp)?; recent
//     let initialization_timestamp: i64 = interest_config.initialization_timestamp.into(); //added
//     let time_elapsed = get_time_elapsed(initialization_timestamp)?;// added
//     let base_amount = token_amount as f64 / exchange_rate;
//     let stablebond_amount = base_amount
//         / (1.0_f64 + rate).powf(time_elapsed / (365.0 * 24.0 * 60.0 * 60.0));
//     Ok(stablebond_amount as u64)
// } //added 31
fn calculate_stablebond_amount(
    token_amount: u64,
    exchange_rate: f64,
    mint_info: &AccountInfo,
) -> Result<u64> {
    let (interest_config, rate) = get_interest_config_and_rate(mint_info)?;
    let initialization_timestamp: i64 = interest_config.initialization_timestamp.into();
    let time_elapsed = get_time_elapsed(initialization_timestamp)?;
    let base_amount = token_amount as f64 / exchange_rate;
    let stablebond_amount = base_amount
        / (1.0_f64 + rate).powf(time_elapsed / (365.0 * 24.0 * 60.0 * 60.0));
    Ok(stablebond_amount as u64)
}
// Events
#[event]
pub struct StablecoinCreated {
pub creator: Pubkey,
pub mint: Pubkey,
pub name: String,
pub symbol: String,
pub target_currency: String,
}
#[event]
pub struct TokensMinted {
pub user: Pubkey,
pub amount: u64,
pub stablebond_amount: u64,
}
#[event]
pub struct TokensRedeemed {
pub user: Pubkey,
pub amount: u64,
pub stablebond_amount: u64,
}
// Error Codes
#[error_code]
pub enum ErrorCode {
#[msg("Calculation overflow occurred")]
CalculationOverflow,
#[msg("Invalid stablebond mint")]
InvalidStablebondMint,
#[msg("Invalid decimals (must be <= 9)")]
InvalidDecimals,
#[msg("Invalid name (must be <= 32 chars)")]
InvalidName,
#[msg("Invalid symbol (must be <= 8 chars)")]
InvalidSymbol,
#[msg("Invalid icon URL (must be <= 128 chars)")]
InvalidIconUrl,
#[msg("Invalid currency")]
InvalidCurrency,
#[msg("Invalid oracle data")]
InvalidOracleData,
#[msg("Invalid exchange rate")]
InvalidExchangeRate,
#[msg("Slippage tolerance exceeded")]
SlippageExceeded,
#[msg("Oracle data is stale")]
StaleOracle,
#[msg("Token-2022 interest rate configuration error")]
InterestRateError,
}







//TO ADD for verifing yield rate
// Add to program module
// pub fn verify_yield_rate(ctx: Context<VerifyYieldRate>) -> Result<()> {
//     let mint_info = ctx.accounts.stablebond_mint.to_account_info();
//     let interest_config = InterestBearingConfig::unpack_from_slice(&mint_info.data.borrow())?;
    
//     let rate = interest_config.rate as f64 / (u64::MAX as f64);
//     let current_apy = calculate_apy_from_rate(rate)?;
    
//     // Verify the rate is within acceptable bounds
//     require!(
//         current_apy > MIN_APY && current_apy < MAX_APY,
//         ErrorCode::InvalidYieldRate
//     );

//     emit!(YieldRateVerified {
//         stablecoin: ctx.accounts.stablecoin_data.key(),
//         current_apy,
//         timestamp: Clock::get()?.unix_timestamp,
//     });

//     Ok(())
// }

// #[derive(Accounts)]
// pub struct VerifyYieldRate<'info> {
//     pub authority: Signer<'info>,
//     #[account(mut)]
//     pub stablecoin_data: Account<'info, StablecoinData>,
//     pub stablebond_mint: Account<'info, token_2022::Mint>,
// }

// fn calculate_apy_from_rate(rate: f64) -> Result<f64> {
//     let compounds_per_year = 365.0 * 24.0;
//     let apy = ((1.0 + rate / compounds_per_year).powf(compounds_per_year) - 1.0) * 100.0;
//     Ok(apy)
// }

// #[event]
// pub struct YieldRateVerified {
//     pub stablecoin: Pubkey,
//     pub current_apy: f64,
//     pub timestamp: i64,
// }

// const MIN_APY: f64 = 0.01; // 0.01%
// const MAX_APY: f64 = 20.0; // 20%

// #[error_code]
// pub enum ErrorCode {
//     // ... existing errors ...
//     #[msg("Invalid yield rate")]
//     InvalidYieldRate,
// }