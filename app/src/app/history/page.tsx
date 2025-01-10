// use anchor_lang::prelude::*;
// use anchor_spl::token::{self, Mint, Token, TokenAccount};
// use switchboard_v2::AggregatorAccountData;
// use std::str::FromStr;

// declare_id!("your_program_id");

// // Constants for validation
// const MAX_NAME_LENGTH: usize = 32;
// const MAX_SYMBOL_LENGTH: usize = 8;
// const MAX_ICON_URL_LENGTH: usize = 128;
// const MAX_CURRENCY_LENGTH: usize = 16;

// // Oracle feed mapping for Etherfuse-supported currencies
// const ORACLE_FEEDS: &[(&str, &str)] = &[
//     ("USD", "Frkcq8bWREur6hRrtGZidPDn1P3Byi8fjbJxfiJvRWFB"),
//     ("EUR", "7Eg6PFHteYGPr4PwpcDVibFtAihuzyB5BgqYK4DB8u3Q"),
//     ("MXN", "Frkcq8bWREur6hRrtGZidPDn1P3Byi8fjbJxfiJvRWFB"),
// ];

// #[program]
// pub mod etherfuse_stablecoin_factory {
//     use super::*;

//     // Create a new stablecoin backed by Etherfuse stablebonds
//     pub fn create_stablecoin(
//         ctx: Context<CreateStablecoin>,
//         name: String,
//         symbol: String,
//         decimals: u8,
//         icon_url: String,
//         target_currency: String,
//     ) -> Result<()> {
//         // Validate inputs
//         require!(decimals <= 9, ErrorCode::InvalidDecimals);
//         require!(!name.is_empty() && name.len() <= MAX_NAME_LENGTH, ErrorCode::InvalidName);
//         require!(!symbol.is_empty() && symbol.len() <= MAX_SYMBOL_LENGTH, ErrorCode::InvalidSymbol);
//         require!(!icon_url.is_empty() && icon_url.len() <= MAX_ICON_URL_LENGTH, ErrorCode::InvalidIconUrl);
//         require!(!target_currency.is_empty() && target_currency.len() <= MAX_CURRENCY_LENGTH, ErrorCode::InvalidCurrency);
//         require!(ctx.accounts.stablebond_mint.is_initialized, ErrorCode::InvalidStablebondMint);

//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         stablecoin.creator = ctx.accounts.creator.key();
//         stablecoin.stablebond_mint = ctx.accounts.stablebond_mint.key();
//         stablecoin.name = name;
//         stablecoin.symbol = symbol;
//         stablecoin.icon_url = icon_url;
//         stablecoin.target_currency = target_currency;
//         stablecoin.decimals = decimals;
//         stablecoin.total_supply = 0;
//         stablecoin.total_stablebonds = 0;
//         stablecoin.oracle = get_oracle_feed(&target_currency)?;
//         stablecoin.creation_time = Clock::get()?.unix_timestamp;

//         // Initialize yield tracking
//         stablecoin.last_yield_collection = Clock::get()?.unix_timestamp;
//         stablecoin.accumulated_yield = 0;

//         Ok(())
//     }

//     // Mint stablecoins by depositing Etherfuse stablebonds
//     pub fn mint_tokens(
//         ctx: Context<MintTokens>,
//         stablebond_amount: u64,
//         minimum_tokens_out: u64,
//     ) -> Result<()> {
//         // Verify oracle price
//         let oracle_feed = &ctx.accounts.oracle_feed.load()?;
//         let price = oracle_feed.latest_confirmed_round.result;
//         require!(price.scale >= 0, ErrorCode::InvalidOracleData);
        
//         let exchange_rate = (price.mantissa as f64) * 10f64.powi(price.scale as i32);
//         require!(exchange_rate > 0.0, ErrorCode::InvalidExchangeRate);

//         // Calculate stablecoin amount based on stablebond value
//         let token_amount = (stablebond_amount as f64 * exchange_rate) as u64;
//         require!(token_amount >= minimum_tokens_out, ErrorCode::SlippageExceeded);

//         // Transfer stablebonds to program vault
//         token::transfer(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Transfer {
//                     from: ctx.accounts.user_stablebond_account.to_account_info(),
//                     to: ctx.accounts.program_stablebond_account.to_account_info(),
//                     authority: ctx.accounts.user.to_account_info(),
//                 },
//             ),
//             stablebond_amount,
//         )?;

//         // Mint stablecoins to user
//         token::mint_to(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::MintTo {
//                     mint: ctx.accounts.stablecoin_mint.to_account_info(),
//                     to: ctx.accounts.user_token_account.to_account_info(),
//                     authority: ctx.accounts.creator.to_account_info(),
//                 },
//             ),
//             token_amount,
//         )?;

//         // Update state
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         stablecoin.total_supply = stablecoin.total_supply
//             .checked_add(token_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;
//         stablecoin.total_stablebonds = stablecoin.total_stablebonds
//             .checked_add(stablebond_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         Ok(())
//     }

//     // Redeem stablecoins for underlying stablebonds
//     pub fn redeem_tokens(
//         ctx: Context<RedeemTokens>,
//         token_amount: u64,
//         minimum_stablebonds_out: u64,
//     ) -> Result<()> {
//         // Verify oracle price
//         let oracle_feed = &ctx.accounts.oracle_feed.load()?;
//         let price = oracle_feed.latest_confirmed_round.result;
//         require!(price.scale >= 0, ErrorCode::InvalidOracleData);
        
//         let exchange_rate = (price.mantissa as f64) * 10f64.powi(price.scale as i32);
//         require!(exchange_rate > 0.0, ErrorCode::InvalidExchangeRate);

//         // Calculate stablebond amount
//         let stablebond_amount = (token_amount as f64 / exchange_rate) as u64;
//         require!(stablebond_amount >= minimum_stablebonds_out, ErrorCode::SlippageExceeded);

//         // Burn stablecoins
//         token::burn(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Burn {
//                     mint: ctx.accounts.stablecoin_mint.to_account_info(),
//                     from: ctx.accounts.user_token_account.to_account_info(),
//                     authority: ctx.accounts.user.to_account_info(),
//                 },
//             ),
//             token_amount,
//         )?;

//         // Return stablebonds to user
//         token::transfer(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Transfer {
//                     from: ctx.accounts.program_stablebond_account.to_account_info(),
//                     to: ctx.accounts.user_stablebond_account.to_account_info(),
//                     authority: ctx.accounts.creator.to_account_info(),
//                 },
//             ),
//             stablebond_amount,
//         )?;

//         // Update state
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         stablecoin.total_supply = stablecoin.total_supply
//             .checked_sub(token_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;
//         stablecoin.total_stablebonds = stablecoin.total_stablebonds
//             .checked_sub(stablebond_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         Ok(())
//     }

//     // Collect and distribute yield from stablebonds
//     pub fn collect_yield(
//         ctx: Context<CollectYield>,
//     ) -> Result<()> {
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         let current_time = Clock::get()?.unix_timestamp;
        
//         // Calculate yield from Etherfuse stablebonds
//         // This would integrate with Etherfuse's yield calculation mechanism
//         let yield_amount = calculate_stablebond_yield(
//             stablecoin.total_stablebonds,
//             stablecoin.last_yield_collection,
//             current_time,
//         )?;

//         stablecoin.accumulated_yield = stablecoin.accumulated_yield
//             .checked_add(yield_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;
//         stablecoin.last_yield_collection = current_time;

//         Ok(())
//     }
// }

// // Account Structures
// #[derive(Accounts)]
// #[instruction(
//     name: String,
//     symbol: String,
//     decimals: u8,
//     icon_url: String,
//     target_currency: String,
// )]
// pub struct CreateStablecoin<'info> {
//     #[account(mut)]
//     pub creator: Signer<'info>,

//     #[account(
//         init,
//         payer = creator,
//         space = StablecoinData::SIZE
//     )]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(
//         init,
//         payer = creator,
//         mint::decimals = decimals,
//         mint::authority = creator.key(),
//     )]
//     pub stablecoin_mint: Account<'info, Mint>,

//     pub stablebond_mint: Account<'info, Mint>,
    
//     pub token_program: Program<'info, Token>,
//     pub system_program: Program<'info, System>,
//     pub rent: Sysvar<'info, Rent>,
// }

// #[derive(Accounts)]
// pub struct MintTokens<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,

//     pub creator: AccountInfo<'info>,

//     #[account(mut)]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(mut)]
//     pub stablecoin_mint: Account<'info, Mint>,

//     #[account(
//         mut,
//         constraint = user_token_account.owner == user.key(),
//         constraint = user_token_account.mint == stablecoin_mint.key()
//     )]
//     pub user_token_account: Account<'info, TokenAccount>,

//     #[account(
//         mut,
//         constraint = user_stablebond_account.owner == user.key(),
//         constraint = user_stablebond_account.mint == stablecoin_data.stablebond_mint
//     )]
//     pub user_stablebond_account: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub program_stablebond_account: Account<'info, TokenAccount>,

//     #[account(
//         constraint = oracle_feed.key() == stablecoin_data.oracle
//     )]
//     pub oracle_feed: AccountLoader<'info, AggregatorAccountData>,

//     pub token_program: Program<'info, Token>,
// }

// #[derive(Accounts)]
// pub struct RedeemTokens<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,

//     pub creator: AccountInfo<'info>,

//     #[account(mut)]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(mut)]
//     pub stablecoin_mint: Account<'info, Mint>,

//     #[account(mut)]
//     pub user_stablebond_account: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub program_stablebond_account: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub user_token_account: Account<'info, TokenAccount>,

//     #[account(
//         constraint = oracle_feed.key() == stablecoin_data.oracle
//     )]
//     pub oracle_feed: AccountLoader<'info, AggregatorAccountData>,

//     pub token_program: Program<'info, Token>,
// }

// #[derive(Accounts)]
// pub struct CollectYield<'info> {
//     #[account(mut)]
//     pub creator: Signer<'info>,

//     #[account(
//         mut,
//         has_one = creator,
//     )]
//     pub stablecoin_data: Account<'info, StablecoinData>,
// }

// // Account Data Structure
// #[account]
// pub struct StablecoinData {
//     pub creator: Pubkey,
//     pub stablebond_mint: Pubkey,
//     pub oracle: Pubkey,
//     pub name: String,
//     pub symbol: String,
//     pub icon_url: String,
//     pub target_currency: String,
//     pub decimals: u8,
//     pub total_supply: u64,
//     pub total_stablebonds: u64,
//     pub creation_time: i64,
//     pub last_yield_collection: i64,
//     pub accumulated_yield: u64,
// }

// impl StablecoinData {
//     pub const SIZE: usize = 8 +  // discriminator
//         32 +  // creator
//         32 +  // stablebond_mint
//         32 +  // oracle
//         4 + MAX_NAME_LENGTH +  // name
//         4 + MAX_SYMBOL_LENGTH +  // symbol
//         4 + MAX_ICON_URL_LENGTH +  // icon_url
//         4 + MAX_CURRENCY_LENGTH +  // target_currency
//         1 +  // decimals
//         8 +  // total_supply
//         8 +  // total_stablebonds
//         8 +  // creation_time
//         8 +  // last_yield_collection
//         8;   // accumulated_yield
// }

// // Helper Functions
// fn get_oracle_feed(currency: &str) -> Result<Pubkey> {
//     for &(curr, feed) in ORACLE_FEEDS {
//         if curr == currency {
//             return Ok(Pubkey::from_str(feed).unwrap());
//         }
//     }
//     Err(error!(ErrorCode::InvalidCurrency))
// }

// fn calculate_stablebond_yield(
//     total_stablebonds: u64,
//     last_collection: i64,
//     current_time: i64,
// ) -> Result<u64> {
//     // This function would integrate with Etherfuse's yield calculation
//     // For now, we'll use a placeholder calculation
//     let time_elapsed = (current_time - last_collection) as u64;
//     let yield_rate = 5; // 5% annual yield (simplified)
//     let yield_amount = (total_stablebonds as u128 * yield_rate as u128 * time_elapsed as u128)
//         / (365 * 24 * 60 * 60 * 100) as u128;
//     Ok(yield_amount as u64)
// }

// #[error_code]
// pub enum ErrorCode {
//     #[msg("Calculation overflow occurred")]
//     CalculationOverflow,
//     #[msg("Invalid stablebond mint")]
//     InvalidStablebondMint,
//     #[msg("
//         #[error_code]
// pub enum ErrorCode {
//     #[msg("Calculation overflow occurred")]
//     CalculationOverflow,
//     #[msg("Invalid stablebond mint")]
//     InvalidStablebondMint,
//     #[msg("Invalid decimals")]
//     InvalidDecimals,
//     #[msg("Invalid name")]
//     InvalidName,
//     #[msg("Invalid symbol")]
//     InvalidSymbol,
//     #[msg("Invalid icon URL")]
//     InvalidIconUrl,
//     #[msg("Invalid currency")]
//     InvalidCurrency,
//     #[msg("Invalid oracle data")]
//     InvalidOracleData,
//     #[msg("Invalid exchange rate")]
//     InvalidExchangeRate,
//     #[msg("Slippage tolerance exceeded")]
//     SlippageExceeded,
//     #[msg("Unauthorized")]
//     Unauthorized,
// }

// // Event structure for frontend tracking
// #[event]
// pub struct StablecoinCreated {
//     pub creator: Pubkey,
//     pub mint: Pubkey,
//     pub name: String,
//     pub symbol: String,
//     pub target_currency: String,
// }

// #[event]
// pub struct TokensMinted {
//     pub user: Pubkey,
//     pub amount: u64,
//     pub stablebond_amount: u64,
// }

// #[event]
// pub struct TokensRedeemed {
//     pub user: Pubkey,
//     pub amount: u64,
//     pub stablebond_amount: u64,
// }













// #![cfg_attr(feature = "program", compiler_builtins::stack_size = "8192")]

// use anchor_lang::prelude::*;
// use anchor_spl::token::{self, Mint, Token, TokenAccount};
// use switchboard_v2::AggregatorAccountData;
// use std::str::FromStr;

// declare_id!("your_program_id");

// // Constants
// const MAX_NAME_LENGTH: usize = 32;
// const MAX_SYMBOL_LENGTH: usize = 8;
// const MAX_ICON_URL_LENGTH: usize = 128;
// const MAX_TARGET_CURRENCY_LENGTH: usize = 16;
// const MAX_ORACLE_STALENESS: i64 = 300; // 5 minutes
// const MIN_COLLATERAL_RATIO: u64 = 100; // 100%
// const MAX_FEE_PERCENTAGE: u64 = 500;   // 5%

// // Oracle feed mapping
// const ORACLE_FEEDS: &[(&str, &str)] = &[
//     ("USD", "Frkcq8bWREur6hRrtGZidPDn1P3Byi8fjbJxfiJvRWFB"),
//     ("EUR", "7Eg6PFHteYGPr4PwpcDVibFtAihuzyB5BgqYK4DB8u3Q"),
//     ("MXN", "Frkcq8bWREur6hRrtGZidPDn1P3Byi8fjbJxfiJvRWFB"),
// ];

// #[program]
// pub mod enhanced_stablecoin {
//     use super::*;

//     pub fn create_stablecoin(
//         ctx: Context<CreateStablecoin>,
//         name: String,
//         symbol: String,
//         decimals: u8,
//         icon_url: String,
//         target_currency: String,
//         fee_percentage: u64,
//         minimum_collateral_ratio: u64,
//     ) -> Result<()> {
//         // Validate inputs
//         require!(decimals <= 9, ErrorCode::InvalidDecimals);
//         require!(!name.is_empty() && name.len() <= MAX_NAME_LENGTH, ErrorCode::InvalidName);
//         require!(!symbol.is_empty() && symbol.len() <= MAX_SYMBOL_LENGTH, ErrorCode::InvalidSymbol);
//         require!(!icon_url.is_empty() && icon_url.len() <= MAX_ICON_URL_LENGTH, ErrorCode::InvalidIconUrl);
//         require!(!target_currency.is_empty() && target_currency.len() <= MAX_TARGET_CURRENCY_LENGTH, ErrorCode::InvalidCurrency);
//         require!(fee_percentage <= MAX_FEE_PERCENTAGE, ErrorCode::InvalidFeePercentage);
//         require!(minimum_collateral_ratio >= MIN_COLLATERAL_RATIO, ErrorCode::InvalidCollateralRatio);
//         require!(ctx.accounts.bond_mint.is_initialized, ErrorCode::InvalidBondMint);

//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         stablecoin.authority = ctx.accounts.authority.key();
//         stablecoin.bond_mint = ctx.accounts.bond_mint.key();
//         stablecoin.oracle = get_oracle_feed(&target_currency)?;
//         stablecoin.name = name;
//         stablecoin.symbol = symbol;
//         stablecoin.icon_url = icon_url;
//         stablecoin.target_currency = target_currency;
//         stablecoin.decimals = decimals;
//         stablecoin.fee_percentage = fee_percentage;
//         stablecoin.minimum_collateral_ratio = minimum_collateral_ratio;
//         stablecoin.total_supply = 0;
//         stablecoin.total_collateral = 0;
//         stablecoin.total_fees_collected = 0;

//         Ok(())
//     }

//     pub fn mint_tokens(
//         ctx: Context<MintTokens>,
//         bond_amount: u64,
//         minimum_tokens_out: u64,
//     ) -> Result<()> {
//         // Verify oracle staleness
//         let oracle_feed = &ctx.accounts.oracle_feed.load()?;
//         require!(
//             !is_oracle_stale(oracle_feed)?,
//             ErrorCode::StaleOracle
//         );

//         let price = oracle_feed.latest_confirmed_round.result;
//         require!(price.scale >= 0, ErrorCode::InvalidOracleData);
        
//         // Calculate tokens and fees
//         let exchange_rate = (price.mantissa as f64) * 10f64.powi(price.scale as i32);
//         require!(exchange_rate > 0.0, ErrorCode::InvalidExchangeRate);

//         let (token_amount, fee_amount) = calculate_mint_amount_with_fees(
//             bond_amount,
//             exchange_rate,
//             ctx.accounts.stablecoin_data.fee_percentage,
//         )?;

//         require!(token_amount >= minimum_tokens_out, ErrorCode::SlippageExceeded);

//         // Verify collateral ratio
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         let new_supply = stablecoin.total_supply
//             .checked_add(token_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;
//         let new_collateral = stablecoin.total_collateral
//             .checked_add(bond_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         require!(
//             check_collateral_ratio(
//                 new_supply,
//                 new_collateral,
//                 exchange_rate,
//                 stablecoin.minimum_collateral_ratio,
//             )?,
//             ErrorCode::InsufficientCollateral
//         );

//         // Transfer bonds to program account
//         token::transfer(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Transfer {
//                     from: ctx.accounts.user_bond_account.to_account_info(),
//                     to: ctx.accounts.program_bond_account.to_account_info(),
//                     authority: ctx.accounts.authority.to_account_info(),
//                 },
//             ),
//             bond_amount,
//         )?;

//         // Mint tokens to user
//         token::mint_to(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::MintTo {
//                     mint: ctx.accounts.stablecoin_mint.to_account_info(),
//                     to: ctx.accounts.user_token_account.to_account_info(),
//                     authority: ctx.accounts.authority.to_account_info(),
//                 },
//             ),
//             token_amount,
//         )?;

//         // Update state
//         stablecoin.total_supply = new_supply;
//         stablecoin.total_collateral = new_collateral;
//         stablecoin.total_fees_collected = stablecoin.total_fees_collected
//             .checked_add(fee_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         Ok(())
//     }

//     pub fn redeem_tokens(
//         ctx: Context<RedeemTokens>,
//         token_amount: u64,
//         minimum_bond_amount: u64,
//     ) -> Result<()> {
//         // Verify oracle staleness
//         let oracle_feed = &ctx.accounts.oracle_feed.load()?;
//         require!(
//             !is_oracle_stale(oracle_feed)?,
//             ErrorCode::StaleOracle
//         );

//         let price = oracle_feed.latest_confirmed_round.result;
//         require!(price.scale >= 0, ErrorCode::InvalidOracleData);
        
//         let exchange_rate = (price.mantissa as f64) * 10f64.powi(price.scale as i32);
//         require!(exchange_rate > 0.0, ErrorCode::InvalidExchangeRate);

//         let bond_amount = calculate_redeem_amount(token_amount, exchange_rate)?;
//         require!(bond_amount >= minimum_bond_amount, ErrorCode::SlippageExceeded);

//         // Verify remaining collateral ratio
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         let new_supply = stablecoin.total_supply
//             .checked_sub(token_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;
//         let new_collateral = stablecoin.total_collateral
//             .checked_sub(bond_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         require!(
//             check_collateral_ratio(
//                 new_supply,
//                 new_collateral,
//                 exchange_rate,
//                 stablecoin.minimum_collateral_ratio,
//             )?,
//             ErrorCode::CollateralRatioTooLow
//         );

//         // Burn tokens
//         token::burn(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Burn {
//                     mint: ctx.accounts.stablecoin_mint.to_account_info(),
//                     from: ctx.accounts.user_token_account.to_account_info(),
//                     authority: ctx.accounts.authority.to_account_info(),
//                 },
//             ),
//             token_amount,
//         )?;

//         // Transfer bonds back to user
//         token::transfer(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Transfer {
//                     from: ctx.accounts.program_bond_account.to_account_info(),
//                     to: ctx.accounts.user_bond_account.to_account_info(),
//                     authority: ctx.accounts.authority.to_account_info(),
//                 },
//             ),
//             bond_amount,
//         )?;

//         // Update state
//         stablecoin.total_supply = new_supply;
//         stablecoin.total_collateral = new_collateral;

//         Ok(())
//     }

//     pub fn collect_fees(
//         ctx: Context<CollectFees>,
//     ) -> Result<u64> {
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         let amount = stablecoin.total_fees_collected;
//         stablecoin.total_fees_collected = 0;
//         Ok(amount)
//     }
// }

// // Helper Functions
// fn get_oracle_feed(currency: &str) -> Result<Pubkey> {
//     for &(curr, feed) in ORACLE_FEEDS {
//         if curr == currency {
//             return Ok(Pubkey::from_str(feed).unwrap());
//         }
//     }
//     Err(error!(ErrorCode::InvalidCurrency))
// }

// fn is_oracle_stale(oracle_data: &AggregatorAccountData) -> Result<bool> {
//     let staleness = Clock::get()?.unix_timestamp - oracle_data.latest_confirmed_round.round_open_timestamp;
//     Ok(staleness > MAX_ORACLE_STALENESS)
// }

// fn calculate_mint_amount_with_fees(
//     bond_amount: u64,
//     exchange_rate: f64,
//     fee_percentage: u64,
// ) -> Result<(u64, u64)> {
//     let total_amount = (bond_amount as f64 * exchange_rate) as u64;
//     let fee_amount = (total_amount as u128 * fee_percentage as u128 / 10000) as u64;
//     let token_amount = total_amount.checked_sub(fee_amount).ok_or(ErrorCode::CalculationOverflow)?;
//     Ok((token_amount, fee_amount))
// }

// fn calculate_redeem_amount(
//     token_amount: u64,
//     exchange_rate: f64,
// ) -> Result<u64> {
//     Ok((token_amount as f64 / exchange_rate) as u64)
// }

// fn check_collateral_ratio(
//     supply: u64,
//     collateral: u64,
//     exchange_rate: f64,
//     minimum_ratio: u64,
// ) -> Result<bool> {
//     if supply == 0 {
//         return Ok(true);
//     }
    
//     let collateral_value = (collateral as f64 * exchange_rate) as u64;
//     let ratio = (collateral_value as u128 * 100) / (supply as u128);
//     Ok(ratio >= minimum_ratio as u128)
// }

// // Account Structures
// #[derive(Accounts)]
// #[instruction(
//     name: String,
//     symbol: String,
//     decimals: u8,
//     icon_url: String,
//     target_currency: String,
//     fee_percentage: u64,
//     minimum_collateral_ratio: u64,
// )]
// pub struct CreateStablecoin<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,

//     #[account(
//         init,
//         payer = authority,
//         space = StablecoinData::SIZE
//     )]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(
//         init,
//         payer = authority,
//         mint::decimals = decimals,
//         mint::authority = authority.key(),
//     )]
//     pub stablecoin_mint: Account<'info, Mint>,

//     pub bond_mint: Account<'info, Mint>,
    
//     pub token_program: Program<'info, Token>,
//     pub system_program: Program<'info, System>,
//     pub rent: Sysvar<'info, Rent>,
// }

// #[derive(Accounts)]
// pub struct MintTokens<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,

//     #[account(mut)]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(mut)]
//     pub stablecoin_mint: Account<'info, Mint>,

//     #[account(
//         mut,
//         constraint = user_token_account.owner == authority.key(),
//         constraint = user_token_account.mint == stablecoin_mint.key()
//     )]
//     pub user_token_account: Account<'info, TokenAccount>,

//     #[account(
//         mut,
//         constraint = user_bond_account.owner == authority.key(),
//         constraint = user_bond_account.mint == stablecoin_data.bond_mint
//     )]
//     pub user_bond_account: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub program_bond_account: Account<'info, TokenAccount>,

//     #[account(
//         constraint = oracle_feed.key() == stablecoin_data.oracle
//     )]
//     pub oracle_feed: AccountLoader<'info, AggregatorAccountData>,

//     pub token_program: Program<'info, Token>,
// }

// #[derive(Accounts)]
// pub struct RedeemTokens<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,

//     #[account(mut)]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(mut)]
//     pub stablecoin_mint: Account<'info, Mint>,

//     #[account(mut)]
//     pub user_bond_account: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub program_bond_account: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub user_token_account: Account<'info, TokenAccount>,

//     #[account(
//         constraint = oracle_feed.key() == stablecoin_data.oracle
//     )]
//     pub oracle_feed: AccountLoader<'info, AggregatorAccountData>,

//     pub token_program: Program<'info, Token>,
// }

// #[derive(Accounts)]
// pub struct CollectFees<'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,

//         #[account(mut)]
//     pub authority: Signer<'info>,

//     #[account(
//         mut,
//         has_one = authority,
//     )]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(mut)]
//     pub fee_token_account: Account<'info, TokenAccount>,
// }

// #[account]
// pub struct StablecoinData {
//     pub authority: Pubkey,
//     pub bond_mint: Pubkey,
//     pub oracle: Pubkey,
//     pub name: String,
//     pub symbol: String,
//     pub icon_url: String,
//     pub target_currency: String,
//     pub decimals: u8,
//     pub fee_percentage: u64,
//     pub minimum_collateral_ratio: u64,
//     pub total_supply: u64,
//     pub total_collateral: u64,
//     pub total_fees_collected: u64,
// }

// impl StablecoinData {
//     pub const SIZE: usize = 8 +  // discriminator
//         32 +  // authority
//         32 +  // bond_mint
//         32 +  // oracle
//         4 + MAX_NAME_LENGTH +  // name
//         4 + MAX_SYMBOL_LENGTH +  // symbol
//         4 + MAX_ICON_URL_LENGTH +  // icon_url
//         4 + MAX_TARGET_CURRENCY_LENGTH +  // target_currency
//         1 +  // decimals
//         8 +  // fee_percentage
//         8 +  // minimum_collateral_ratio
//         8 +  // total_supply
//         8 +  // total_collateral
//         8;   // total_fees_collected
// }

// #[error_code]
// pub enum ErrorCode {
//     #[msg("Calculation overflow occurred")]
//     CalculationOverflow,
    
//     #[msg("Invalid bond mint")]
//     InvalidBondMint,
    
//     #[msg("Invalid decimals (must be <= 9)")]
//     InvalidDecimals,
    
//     #[msg("Invalid name (must be <= 32 chars)")]
//     InvalidName,
    
//     #[msg("Invalid symbol (must be <= 8 chars)")]
//     InvalidSymbol,
    
//     #[msg("Invalid icon URL (must be <= 128 chars)")]
//     InvalidIconUrl,
    
//     #[msg("Invalid currency")]
//     InvalidCurrency,
    
//     #[msg("Invalid oracle data")]
//     InvalidOracleData,
    
//     #[msg("Invalid exchange rate")]
//     InvalidExchangeRate,
    
//     #[msg("Slippage tolerance exceeded")]
//     SlippageExceeded,
    
//     #[msg("Oracle data is stale")]
//     StaleOracle,
    
//     #[msg("Invalid fee percentage (must be <= 5%)")]
//     InvalidFeePercentage,
    
//     #[msg("Invalid collateral ratio (must be >= 100%)")]
//     InvalidCollateralRatio,
    
//     #[msg("Insufficient collateral for operation")]
//     InsufficientCollateral,
    
//     #[msg("Collateral ratio too low after operation")]
//     CollateralRatioTooLow,
// }






// use anchor_lang::prelude::*;
// use anchor_spl::token::{self, Mint, Token, TokenAccount};
// use switchboard_v2::AggregatorAccountData;
// use std::str::FromStr;

// declare_id!("your_program_id");

// // Constants
// const MAX_NAME_LENGTH: usize = 32;
// const MAX_SYMBOL_LENGTH: usize = 8;
// const MAX_ICON_URL_LENGTH: usize = 128;
// const MAX_CURRENCY_LENGTH: usize = 16;
// const MAX_ORACLE_STALENESS: i64 = 300; // 5 minutes
// const MIN_YIELD_COLLECTION_INTERVAL: i64 = 3600; // 1 hour

// // Oracle feed mapping for supported currencies
// const ORACLE_FEEDS: &[(&str, &str)] = &[
//     ("USD", "Frkcq8bWREur6hRrtGZidPDn1P3Byi8fjbJxfiJvRWFB"),
//     ("EUR", "7Eg6PFHteYGPr4PwpcDVibFtAihuzyB5BgqYK4DB8u3Q"),
//     ("MXN", "Frkcq8bWREur6hRrtGZidPDn1P3Byi8fjbJxfiJvRWFB"),
// ];

// #[program]
// pub mod stablecoin_factory {
//     use super::*;

//     pub fn create_stablecoin(
//         ctx: Context<CreateStablecoin>,
//         name: String,
//         symbol: String,
//         decimals: u8,
//         icon_url: String,
//         target_currency: String,
//         creator_yield_percentage: u8, // Creator's share of yield (0-100)
//     ) -> Result<()> {
//         // Validate inputs
//         require!(decimals <= 9, ErrorCode::InvalidDecimals);
//         require!(!name.is_empty() && name.len() <= MAX_NAME_LENGTH, ErrorCode::InvalidName);
//         require!(!symbol.is_empty() && symbol.len() <= MAX_SYMBOL_LENGTH, ErrorCode::InvalidSymbol);
//         require!(!icon_url.is_empty() && icon_url.len() <= MAX_ICON_URL_LENGTH, ErrorCode::InvalidIconUrl);
//         require!(!target_currency.is_empty() && target_currency.len() <= MAX_CURRENCY_LENGTH, ErrorCode::InvalidCurrency);
//         require!(creator_yield_percentage <= 100, ErrorCode::InvalidYieldPercentage);
//         require!(ctx.accounts.stablebond_mint.is_initialized, ErrorCode::InvalidStablebondMint);

//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         stablecoin.creator = ctx.accounts.creator.key();
//         stablecoin.stablebond_mint = ctx.accounts.stablebond_mint.key();
//         stablecoin.name = name;
//         stablecoin.symbol = symbol;
//         stablecoin.icon_url = icon_url;
//         stablecoin.target_currency = target_currency;
//         stablecoin.decimals = decimals;
//         stablecoin.total_supply = 0;
//         stablecoin.total_stablebonds = 0;
//         stablecoin.oracle = get_oracle_feed(&target_currency)?;
//         stablecoin.creation_time = Clock::get()?.unix_timestamp;
//         stablecoin.last_yield_collection = Clock::get()?.unix_timestamp;
//         stablecoin.creator_yield_percentage = creator_yield_percentage;
//         stablecoin.accumulated_protocol_yield = 0;
//         stablecoin.accumulated_creator_yield = 0;

//         emit!(StablecoinCreated {
//             creator: ctx.accounts.creator.key(),
//             mint: ctx.accounts.stablecoin_mint.key(),
//             name: name.clone(),
//             symbol: symbol.clone(),
//             target_currency: target_currency.clone(),
//         });

//         Ok(())
//     }

//     pub fn mint_tokens(
//         ctx: Context<MintTokens>,
//         stablebond_amount: u64,
//         minimum_tokens_out: u64,
//     ) -> Result<()> {
//         // Verify oracle price and staleness
//         let oracle_feed = &ctx.accounts.oracle_feed.load()?;
//         require!(
//             !is_oracle_stale(oracle_feed)?,
//             ErrorCode::StaleOracle
//         );

//         let price = oracle_feed.latest_confirmed_round.result;
//         require!(price.scale >= 0, ErrorCode::InvalidOracleData);
        
//         let exchange_rate = (price.mantissa as f64) * 10f64.powi(price.scale as i32);
//         require!(exchange_rate > 0.0, ErrorCode::InvalidExchangeRate);

//         // Calculate token amount
//         let token_amount = (stablebond_amount as f64 * exchange_rate) as u64;
//         require!(token_amount >= minimum_tokens_out, ErrorCode::SlippageExceeded);

//         // Transfer stablebonds to program vault
//         token::transfer(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Transfer {
//                     from: ctx.accounts.user_stablebond_account.to_account_info(),
//                     to: ctx.accounts.program_stablebond_account.to_account_info(),
//                     authority: ctx.accounts.user.to_account_info(),
//                 },
//             ),
//             stablebond_amount,
//         )?;

//         // Mint stablecoins to user
//         token::mint_to(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::MintTo {
//                     mint: ctx.accounts.stablecoin_mint.to_account_info(),
//                     to: ctx.accounts.user_token_account.to_account_info(),
//                     authority: ctx.accounts.creator.to_account_info(),
//                 },
//             ),
//             token_amount,
//         )?;

//         // Update state
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         stablecoin.total_supply = stablecoin.total_supply
//             .checked_add(token_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;
//         stablecoin.total_stablebonds = stablecoin.total_stablebonds
//             .checked_add(stablebond_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         emit!(TokensMinted {
//             user: ctx.accounts.user.key(),
//             amount: token_amount,
//             stablebond_amount,
//         });

//         Ok(())
//     }

//     pub fn redeem_tokens(
//         ctx: Context<RedeemTokens>,
//         token_amount: u64,
//         minimum_stablebonds_out: u64,
//     ) -> Result<()> {
//         // Verify oracle price and staleness
//         let oracle_feed = &ctx.accounts.oracle_feed.load()?;
//         require!(
//             !is_oracle_stale(oracle_feed)?,
//             ErrorCode::StaleOracle
//         );

//         let price = oracle_feed.latest_confirmed_round.result;
//         require!(price.scale >= 0, ErrorCode::InvalidOracleData);
        
//         let exchange_rate = (price.mantissa as f64) * 10f64.powi(price.scale as i32);
//         require!(exchange_rate > 0.0, ErrorCode::InvalidExchangeRate);

//         // Calculate stablebond amount
//         let stablebond_amount = (token_amount as f64 / exchange_rate) as u64;
//         require!(stablebond_amount >= minimum_stablebonds_out, ErrorCode::SlippageExceeded);

//         // Burn stablecoins
//         token::burn(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Burn {
//                     mint: ctx.accounts.stablecoin_mint.to_account_info(),
//                     from: ctx.accounts.user_token_account.to_account_info(),
//                     authority: ctx.accounts.user.to_account_info(),
//                 },
//             ),
//             token_amount,
//         )?;

//         // Return stablebonds to user
//         token::transfer(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Transfer {
//                     from: ctx.accounts.program_stablebond_account.to_account_info(),
//                     to: ctx.accounts.user_stablebond_account.to_account_info(),
//                     authority: ctx.accounts.creator.to_account_info(),
//                 },
//             ),
//             stablebond_amount,
//         )?;

//         // Update state
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         stablecoin.total_supply = stablecoin.total_supply
//             .checked_sub(token_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;
//         stablecoin.total_stablebonds = stablecoin.total_stablebonds
//             .checked_sub(stablebond_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         emit!(TokensRedeemed {
//             user: ctx.accounts.user.key(),
//             amount: token_amount,
//             stablebond_amount,
//         });

//         Ok(())
//     }

//     pub fn collect_yield(
//         ctx: Context<CollectYield>,
//     ) -> Result<()> {
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         let current_time = Clock::get()?.unix_timestamp;
        
//         // Ensure minimum time has passed
//         require!(
//             current_time - stablecoin.last_yield_collection >= MIN_YIELD_COLLECTION_INTERVAL,
//             ErrorCode::YieldCollectionTooEarly
//         );

//         // Calculate yield from Etherfuse stablebonds
//         let total_yield = calculate_stablebond_yield(
//             stablecoin.total_stablebonds,
//             stablecoin.last_yield_collection,
//             current_time,
//         )?;

//         // Split yield between creator and protocol
//         let creator_share = (total_yield as u128 * stablecoin.creator_yield_percentage as u128 / 100) as u64;
//         let protocol_share = total_yield.checked_sub(creator_share).ok_or(ErrorCode::CalculationOverflow)?;

//         // Update accumulated yields
//         stablecoin.accumulated_creator_yield = stablecoin.accumulated_creator_yield
//             .checked_add(creator_share)
//             .ok_or(ErrorCode::CalculationOverflow)?;
//         stablecoin.accumulated_protocol_yield = stablecoin.accumulated_protocol_yield
//             .checked_add(protocol_share)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         stablecoin.last_yield_collection = current_time;

//         emit!(YieldCollected {
//             stablecoin: ctx.accounts.stablecoin_data.key(),
//             total_yield,
//             creator_share,
//             protocol_share,
//         });

//         Ok(())
//     }

//     pub fn withdraw_creator_yield(
//         ctx: Context<WithdrawYield>,
//         amount: u64,
//     ) -> Result<()> {
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         require!(amount <= stablecoin.accumulated_creator_yield, ErrorCode::InsufficientYield);

//         // Transfer yield to creator
//         token::transfer(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Transfer {
//                     from: ctx.accounts.yield_account.to_account_info(),
//                     to: ctx.accounts.creator_account.to_account_info(),
//                     authority: ctx.accounts.creator.to_account_info(),
//                 },
//             ),
//             amount,
//         )?;

//         stablecoin.accumulated_creator_yield = stablecoin.accumulated_creator_yield
//             .checked_sub(amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         emit!(YieldWithdrawn {
//             stablecoin: ctx.accounts.stablecoin_data.key(),
//             amount,
//             recipient: ctx.accounts.creator.key(),
//             yield_type: "creator".to_string(),
//         });

//         Ok(())
//     }
// }

// // Account Structures
// #[derive(Accounts)]
// #[instruction(
//     name: String,
//     symbol: String,
//     decimals: u8,
//     icon_url: String,
//     target_currency: String,
//     creator_yield_percentage: u8,
// )]
// pub struct CreateStablecoin<'info> {
//     #[account(mut)]
//     pub creator: Signer<'info>,

//     #[account(
//         init,
//         payer = creator,
//         space = StablecoinData::SIZE
//     )]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(
//         init,
//         payer = creator,
//         mint::decimals = decimals,
//         mint::authority = creator.key(),
//     )]
//     pub stablecoin_mint: Account<'info, Mint>,

//     pub stablebond_mint: Account<'info, Mint>,
    
//     pub token_program: Program<'info, Token>,
//     pub system_program: Program<'info, System>,
//     pub rent: Sysvar<'info, Rent>,
// }

// #[derive(Accounts)]
// pub struct MintTokens<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,

//     pub creator: AccountInfo<'info>,

//     #[account(mut)]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(mut)]
//     pub stablecoin_mint: Account<'info, Mint>,

//     #[account(
//         mut,
//         constraint = user_token_account.owner == user.key(),
//         constraint = user_token_account.mint == stablecoin_mint.key()
//     )]
//     pub user_token_account: Account<'info, TokenAccount>,

//     #[account(
//         mut,
//         constraint = user_stablebond_account.owner == user.key(),
//         constraint = user_stablebond_account.mint == stablecoin_data.stablebond_mint
//     )]
//     pub user_stablebond_account: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub program_stablebond_account: Account<'info, TokenAccount>,

//     #[account(
//         constraint = oracle_feed.key() == stablecoin_data.oracle
//     )]
//     pub oracle_feed: AccountLoader<'info, AggregatorAccountData>,

//     pub token_program: Program<'info, Token>,
// }

// #[derive(Accounts)]
// pub struct RedeemTokens<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,
    
// #[account(
//         constraint = creator.key() == stablecoin_data.creator
//     )]
//     pub creator: AccountInfo<'info>,

//     #[account(mut)]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(mut,
//          constraint = stablecoin_mint.key() == stablecoin_data.mint)]
//     pub stablecoin_mint: Account<'info, Mint>,

//     #[account(mut, constraint = user_stablebond_account.owner == user.key(),
//         constraint = user_stablebond_account.mint == stablecoin_data.stablebond_mint)] //here
//     pub user_stablebond_account: Account<'info, TokenAccount>,

//     #[account(mut, constraint = program_stablebond_account.owner == creator.key(),
//         constraint = program_stablebond_account.mint == stablecoin_data.stablebond_mint)] //here
//     pub program_stablebond_account: Account<'info, TokenAccount>,

//     #[account(mut, constraint = user_token_account.owner == user.key(),
//         constraint = user_token_account.mint == stablecoin_mint.key())] //here
//     pub user_token_account: Account<'info, TokenAccount>,

//     #[account(
//         constraint = oracle_feed.key() == stablecoin_data.oracle
//     )]
//     pub oracle_feed: AccountLoader<'info, AggregatorAccountData>,

//     pub token_program: Program<'info, Token>,
// }

// #[derive(Accounts)]
// pub struct CollectYield<'info> {
//     #[account(mut)]
//     pub caller: Signer<'info>,

//     #[account(mut)]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(mut)]
//     pub yield_account: Account<'info, TokenAccount>,
// }

// #[derive(Accounts)]
// pub struct WithdrawYield<'info> {
//     #[account(mut)]
//     pub creator: Signer<'info>,

//     #[account(
//         mut,
//         has_one = creator,
//     )]
//     pub stablecoin_data: Account<'info, StablecoinData>,

//     #[account(mut)]
//     pub yield_account: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub creator_account: Account<'info, TokenAccount>,

//     pub token_program: Program<'info, Token>,
// }

// // Account Data Structure
// #[account]
// pub struct StablecoinData {
//     pub creator: Pubkey,
//     pub stablebond_mint: Pubkey,
//     pub oracle: Pubkey,
//     pub name: String,
//     pub symbol: String,
//     pub icon_url: String,
//     pub target_currency: String,
//     pub decimals: u8,
//     pub total_supply: u64,
//     pub total_stablebonds: u64,
//     pub creation_time: i64,
//     pub last_yield_collection: i64,
//     pub creator_yield_percentage: u8,
//     pub accumulated_protocol_yield: u64,
//     pub accumulated_creator_yield: u64,
// }

// impl StablecoinData {
//     pub const SIZE: usize = 8 +  // discriminator
//         32 +  // creator
//         32 +  // stablebond_mint
//         32 +  // oracle
//         4 + MAX_NAME_LENGTH +  // name
//         4 + MAX_SYMBOL_LENGTH +  // symbol
//         4 + MAX_ICON_URL_LENGTH +  // icon_url
//         4 + MAX_CURRENCY_LENGTH +  // target_currency
//         1 +  // decimals
//         8 +  // total_supply
//         8 +  // total_stablebonds
//         8 +  // creation_time
//         8 +  // last_yield_collection
//         1 +  // creator_yield_percentage
//         8 +  // accumulated_protocol_yield
//         8;   // accumulated_creator_yield
// }

// // Helper Functions
// fn get_oracle_feed(currency: &str) -> Result<Pubkey> {
//     for &(curr, feed) in ORACLE_FEEDS {
//         if curr == currency {
//             return Ok(Pubkey::from_str(feed).unwrap());
//         }
//     }
//     Err(error!(ErrorCode::InvalidCurrency))
// }

// fn is_oracle_stale(oracle_data: &AggregatorAccountData) -> Result<bool> {
//     let staleness = Clock::get()?.unix_timestamp - oracle_data.latest_confirmed_round.round_open_timestamp;
//     Ok(staleness > MAX_ORACLE_STALENESS)
// }

// fn calculate_stablebond_yield(
//     total_stablebonds: u64,
//     last_collection: i64,
//     current_time: i64,
// ) -> Result<u64> {
//     // This function would integrate with Etherfuse's yield calculation
//     let time_elapsed = (current_time - last_collection) as u64;
//     let yield_rate = 5; // 5% annual yield (simplified)
//     let yield_amount = (total_stablebonds as u128 * yield_rate as u128 * time_elapsed as u128)
//         / (365 * 24 * 60 * 60 * 100) as u128;
//     Ok(yield_amount as u64)
// }

// // Events
// #[event]
// pub struct StablecoinCreated {
//     pub creator: Pubkey,
//     pub mint: Pubkey,
//     pub name: String,
//     pub symbol: String,
//     pub target_currency: String,
// }

// #[event]
// pub struct TokensMinted {
//     pub user: Pubkey,
//     pub amount: u64,
//     pub stablebond_amount: u64,
// }

// #[event]
// pub struct TokensRedeemed {
//     pub user: Pubkey,
//     pub amount: u64,
//     pub stablebond_amount: u64,
// }

// #[event]
// pub struct YieldCollected {
//     pub stablecoin: Pubkey,
//     pub total_yield: u64,
//     pub creator_share: u64,
//     pub protocol_share: u64,
// }

// #[event]
// pub struct YieldWithdrawn {
//     pub stablecoin: Pubkey,
//     pub amount: u64,
//     pub recipient: Pubkey,
//     pub yield_type: String,
// }

// // Error Codes
// #[error_code]
// pub enum ErrorCode {
//     #[msg("Calculation overflow occurred")]
//     CalculationOverflow,
    
//     #[msg("Invalid stablebond mint")]
//     InvalidStablebondMint,
    
//     #[msg("Invalid decimals (must be <= 9)")]
//     InvalidDecimals,
    
//     #[msg("Invalid name (must be <= 32 chars)")]
//     InvalidName,
    
//     #[msg("Invalid symbol (must be <= 8 chars)")]
//     InvalidSymbol,
    
//     #[msg("Invalid icon URL (must be <= 128 chars)")]
//     InvalidIconUrl,
    
//     #[msg("Invalid currency")]
//     InvalidCurrency,
    
//     #[msg("Invalid oracle data")]
//     InvalidOracleData,
    
//     #[msg("Invalid exchange rate")]
//     InvalidExchangeRate,
    
//     #[msg("Slippage tolerance exceeded")]
//     SlippageExceeded,
    
//     #[msg("Oracle data is stale")]
//     StaleOracle,
    
//     #[msg("Invalid yield percentage (must be 0-100)")]
//     InvalidYieldPercentage,
    
//     #[msg("Yield collection too early")]
//     YieldCollectionTooEarly,
    
//     #[msg("Insufficient yield for withdrawal")]
//     InsufficientYield,
    
//     #[msg("Unauthorized")]
//     Unauthorized,
// }




// //main
// use anchor_lang::prelude::*;
// use anchor_spl::token::{self, Mint, Token, TokenAccount};
// use switchboard_v2::AggregatorAccountData;
// use solana_program::account_info::AccountInfo;
// use etherfuse_yield::YieldCalculator;
// use std::str::FromStr;

// declare_id!("your_program_id");

// // Constants
// const MAX_NAME_LENGTH: usize = 32;
// const MAX_SYMBOL_LENGTH: usize = 8;
// const MAX_ICON_URL_LENGTH: usize = 128;
// const MAX_CURRENCY_LENGTH: usize = 16;
// const MAX_ORACLE_STALENESS: i64 = 300; // 5 minutes
// const MIN_YIELD_COLLECTION_INTERVAL: i64 = 3600; // 1 hour
// const ETHERFUSE_PROGRAM_ID: &str = "eth3rfuseYie1dPr0gramID"; // Replace with actual ID
// const YIELD_PRECISION: u8 = 6;

// // Oracle feed mapping for supported currencies
// const ORACLE_FEEDS: &[(&str, &str)] = &[
//     ("USD", "Frkcq8bWREur6hRrtGZidPDn1P3Byi8fjbJxfiJvRWFB"),
//     ("EUR", "7Eg6PFHteYGPr4PwpcDVibFtAihuzyB5BgqYK4DB8u3Q"),
//     ("MXN", "Frkcq8bWREur6hRrtGZidPDn1P3Byi8fjbJxfiJvRWFB"),
// ];

// #[program]
// pub mod stablecoin_factory {
//     use super::*;

//     pub fn create_stablecoin(
//         ctx: Context<CreateStablecoin>,
//         name: String,
//         symbol: String,
//         decimals: u8,
//         icon_url: String,
//         target_currency: String,
//         creator_yield_percentage: u8,
//     ) -> Result<()> {
//         require!(decimals <= 9, ErrorCode::InvalidDecimals);
//         require!(!name.is_empty() && name.len() <= MAX_NAME_LENGTH, ErrorCode::InvalidName);
//         require!(!symbol.is_empty() && symbol.len() <= MAX_SYMBOL_LENGTH, ErrorCode::InvalidSymbol);
//         require!(!icon_url.is_empty() && icon_url.len() <= MAX_ICON_URL_LENGTH, ErrorCode::InvalidIconUrl);
//         require!(!target_currency.is_empty() && target_currency.len() <= MAX_CURRENCY_LENGTH, ErrorCode::InvalidCurrency);
//         require!(creator_yield_percentage <= 100, ErrorCode::InvalidYieldPercentage);
//         require!(ctx.accounts.stablebond_mint.is_initialized, ErrorCode::InvalidStablebondMint);

//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         stablecoin.creator = ctx.accounts.creator.key();
//         stablecoin.stablebond_mint = ctx.accounts.stablebond_mint.key();
//         stablecoin.name = name;
//         stablecoin.symbol = symbol;
//         stablecoin.icon_url = icon_url;
//         stablecoin.target_currency = target_currency;
//         stablecoin.decimals = decimals;
//         stablecoin.total_supply = 0;
//         stablecoin.total_stablebonds = 0;
//         stablecoin.oracle = get_oracle_feed(&target_currency)?;
//         stablecoin.creation_time = Clock::get()?.unix_timestamp;
//         stablecoin.last_yield_collection = Clock::get()?.unix_timestamp;
//         stablecoin.creator_yield_percentage = creator_yield_percentage;
//         stablecoin.accumulated_protocol_yield = 0;
//         stablecoin.accumulated_creator_yield = 0;

//         emit!(StablecoinCreated {
//             creator: ctx.accounts.creator.key(),
//             mint: ctx.accounts.stablecoin_mint.key(),
//             name: name.clone(),
//             symbol: symbol.clone(),
//             target_currency: target_currency.clone(),
//         });

//         Ok(())
//     }

//     pub fn mint_tokens(
//         ctx: Context<MintTokens>,
//         stablebond_amount: u64,
//         minimum_tokens_out: u64,
//     ) -> Result<()> {
//         let oracle_feed = &ctx.accounts.oracle_feed.load()?;
//         require!(
//             !is_oracle_stale(oracle_feed)?,
//             ErrorCode::StaleOracle
//         );

//         let price = oracle_feed.latest_confirmed_round.result;
//         require!(price.scale >= 0, ErrorCode::InvalidOracleData);
        
//         let exchange_rate = (price.mantissa as f64) * 10f64.powi(price.scale as i32);
//         require!(exchange_rate > 0.0, ErrorCode::InvalidExchangeRate);

//         let token_amount = (stablebond_amount as f64 * exchange_rate) as u64;
//         require!(token_amount >= minimum_tokens_out, ErrorCode::SlippageExceeded);

//         token::transfer(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Transfer {
//                     from: ctx.accounts.user_stablebond_account.to_account_info(),
//                     to: ctx.accounts.program_stablebond_account.to_account_info(),
//                     authority: ctx.accounts.user.to_account_info(),
//                 },
//             ),
//             stablebond_amount,
//         )?;

//         token::mint_to(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::MintTo {
//                     mint: ctx.accounts.stablecoin_mint.to_account_info(),
//                     to: ctx.accounts.user_token_account.to_account_info(),
//                     authority: ctx.accounts.creator.to_account_info(),
//                 },
//             ),
//             token_amount,
//         )?;

//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         stablecoin.total_supply = stablecoin.total_supply
//             .checked_add(token_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;
//         stablecoin.total_stablebonds = stablecoin.total_stablebonds
//             .checked_add(stablebond_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         emit!(TokensMinted {
//             user: ctx.accounts.user.key(),
//             amount: token_amount,
//             stablebond_amount,
//         });

//         Ok(())
//     }

//     pub fn redeem_tokens(
//         ctx: Context<RedeemTokens>,
//         token_amount: u64,
//         minimum_stablebonds_out: u64,
//     ) -> Result<()> {
//         let oracle_feed = &ctx.accounts.oracle_feed.load()?;
//         require!(
//             !is_oracle_stale(oracle_feed)?,
//             ErrorCode::StaleOracle
//         );

//         let price = oracle_feed.latest_confirmed_round.result;
//         require!(price.scale >= 0, ErrorCode::InvalidOracleData);
        
//         let exchange_rate = (price.mantissa as f64) * 10f64.powi(price.scale as i32);
//         require!(exchange_rate > 0.0, ErrorCode::InvalidExchangeRate);

//         let stablebond_amount = (token_amount as f64 / exchange_rate) as u64;
//         require!(stablebond_amount >= minimum_stablebonds_out, ErrorCode::SlippageExceeded);

//         token::burn(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Burn {
//                     mint: ctx.accounts.stablecoin_mint.to_account_info(),
//                     from: ctx.accounts.user_token_account.to_account_info(),
//                     authority: ctx.accounts.user.to_account_info(),
//                 },
//             ),
//             token_amount,
//         )?;

//         token::transfer(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Transfer {
//                     from: ctx.accounts.program_stablebond_account.to_account_info(),
//                     to: ctx.accounts.user_stablebond_account.to_account_info(),
//                     authority: ctx.accounts.creator.to_account_info(),
//                 },
//             ),
//             stablebond_amount,
//         )?;

//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         stablecoin.total_supply = stablecoin.total_supply
//             .checked_sub(token_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;
//         stablecoin.total_stablebonds = stablecoin.total_stablebonds
//             .checked_sub(stablebond_amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         emit!(TokensRedeemed {
//             user: ctx.accounts.user.key(),
//             amount: token_amount,
//             stablebond_amount,
//         });

//         Ok(())
//     }

//     pub fn collect_yield(ctx: Context<CollectYield>) -> Result<()> {
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         let current_time = Clock::get()?.unix_timestamp;
        
//         require!(
//             current_time - stablecoin.last_yield_collection >= MIN_YIELD_COLLECTION_INTERVAL,
//             ErrorCode::YieldCollectionTooEarly
//         );

//         // Calculate yield using Etherfuse integration
//         let total_yield = calculate_stablebond_yield(
//             &ctx.accounts.etherfuse_context,
//             stablecoin.total_stablebonds,
//             stablecoin.last_yield_collection,
//             current_time,
//         )?;

//         let creator_share = (total_yield as u128 * stablecoin.creator_yield_percentage as u128 / 100) as u64;
//         let protocol_share = total_yield.checked_sub(creator_share).ok_or(ErrorCode::CalculationOverflow)?;

//         stablecoin.accumulated_creator_yield = stablecoin.accumulated_creator_yield
//             .checked_add(creator_share)
//             .ok_or(ErrorCode::CalculationOverflow)?;
//         stablecoin.accumulated_protocol_yield = stablecoin.accumulated_protocol_yield
//             .checked_add(protocol_share)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         stablecoin.last_yield_collection = current_time;

//         emit!(YieldCollected {
//             stablecoin: ctx.accounts.stablecoin_data.key(),
//             total_yield,
//             creator_share,
//             protocol_share,
//         });

//         Ok(())
//     }

//     pub fn withdraw_creator_yield(
//         ctx: Context<WithdrawYield>,
//         amount: u64,
//     ) -> Result<()> {
//         let stablecoin = &mut ctx.accounts.stablecoin_data;
//         require!(amount <= stablecoin.accumulated_creator_yield, ErrorCode::InsufficientYield);

//         token::transfer(
//             CpiContext::new(
//                 ctx.accounts.token_program.to_account_info(),
//                 token::Transfer {
//                     from: ctx.accounts.yield_account.to_account_info(),
//                     to: ctx.accounts.creator_account.to_account_info(),
//                     authority: ctx.accounts.creator.to_account_info(),
//                 },
//             ),
//             amount,
//         )?;

//         stablecoin.accumulated_creator_yield = stablecoin.accumulated_creator_yield
//             .checked_sub(amount)
//             .ok_or(ErrorCode::CalculationOverflow)?;

//         emit!(YieldWithdrawn {
//             stablecoin: ctx.accounts.stablecoin_data.key(),
//             amount,
//             recipient: ctx.accounts.creator.key(),
//             yield_type: "creator".to_string(),
//         });

//         Ok(())
//     }
// }

// // Account Structures
// #[derive(Accounts)]
// pub struct EtherfuseYieldContext<'info> {
//     #[account(address = ETHERFUSE_PROGRAM_ID.parse().unwrap())]
//     pub etherfuse_program: AccountInfo<'info>,
//     #[account(mut)]
//     pub yield_data_account: AccountInfo<'info>,
//     pub stablebond_mint: Account<'info, Mint>,
// }

// #[derive(Accounts)]
// #[instruction(
//     name: String,
//     symbol: String,
//     decimals: u8,
//     icon_url: String,
//     target_currency: String,
//     creator_yield_percentage: u8,
// )]
// pub struct CreateStablecoin<'info> {
//     #[account(mut)]
//     pub creator: Signer<'info>,
//     #[account(
//         init,
//         payer = creator,
//         space = StablecoinData::SIZE
//     )]
//     pub stablecoin_data: Account<'info, StablecoinData>,
//     #[account(
//         init,
//         payer = creator,
//         mint::decimals = decimals,
//         mint::authority = creator.key(),
//     )]
//     pub stablecoin_mint: Account<'info, Mint>,
//     pub stablebond_mint: Account<'info, Mint>,
//     pub token_program: Program<'info, Token>,
//     pub system_program: Program<'info, System>,
//     pub rent: Sysvar<'info, Rent>,
// }

// #[derive(Accounts)]
// pub struct MintTokens<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,
//     pub creator: AccountInfo<'info>,
//     #[account(mut)]
//     pub stablecoin_data: Account<'info, StablecoinData>,
//     #[account(mut)]
//     pub stablecoin_mint: Account<'info, Mint>,
//     #[account(
//         mut,
//         constraint = user_token_account.owner == user.key(),
//         constraint = user_token_account.mint == stablecoin_mint.key()
//     )]
//     pub user_token_account: Account<'info, TokenAccount>,
//     #[account(
//         mut,
//         constraint = user_stablebond_account.owner == user.key(),
//         constraint = user_stablebond_account.mint == stablecoin_data.stablebond_mint
//     )]
//     pub user_stablebond_account: Account<'info, TokenAccount>,
//     #[account(mut)]
//     pub program_stablebond_account: Account<'info, TokenAccount>,
//     #[account(
//         constraint = oracle_feed.key() == stablecoin_data.oracle
//     )]
//     pub oracle_feed: AccountLoader<'info, AggregatorAccountData>,
//     pub token_program: Program<'info, Token>,
// }

// #[derive(Accounts)]
// pub struct CollectYield<'info> {
//     #[account(mut)]
//     pub caller: Signer<'info>,
//     #[account(mut)]
//     pub stablecoin_data: Account<'info, StablecoinData>,
//     #[account(mut)]
//     pub yield_account: Account<'info, TokenAccount>,
//     pub etherfuse_context: EtherfuseYieldContext<'info>,
// }

// #[derive(Accounts)]
//     pub struct WithdrawYield<'info> {
//         #[account(mut)]
//         pub creator: Signer<'info>,
//         #[account(
//             mut,
//             has_one = creator,
//         )]
//         pub stablecoin_data: Account<'info, StablecoinData>,
//         #[account(mut)]
//         pub yield_account: Account<'info, TokenAccount>,
//         #[account(mut)]
//         pub creator_account: Account<'info, TokenAccount>,
//         pub token_program: Program<'info, Token>,
//     }

//     #[derive(Accounts)]
//     pub struct RedeemTokens<'info> {
//         #[account(mut)]
//         pub user: Signer<'info>,
//         pub creator: AccountInfo<'info>,
//         #[account(mut)]
//         pub stablecoin_data: Account<'info, StablecoinData>,
//         #[account(mut)]
//         pub stablecoin_mint: Account<'info, Mint>,
//         #[account(mut)]
//         pub user_stablebond_account: Account<'info, TokenAccount>,
//         #[account(mut)]
//         pub program_stablebond_account: Account<'info, TokenAccount>,
//         #[account(mut)]
//         pub user_token_account: Account<'info, TokenAccount>,
//         pub oracle_feed: AccountLoader<'info, AggregatorAccountData>,
//         pub token_program: Program<'info, Token>,
//     }

//     // Account Data Structure
//     #[account]
//     pub struct StablecoinData {
//         pub creator: Pubkey,
//         pub stablebond_mint: Pubkey,
//         pub oracle: Pubkey,
//         pub name: String,
//         pub symbol: String,
//         pub icon_url: String,
//         pub target_currency: String,
//         pub decimals: u8,
//         pub total_supply: u64,
//         pub total_stablebonds: u64,
//         pub creation_time: i64,
//         pub last_yield_collection: i64,
//         pub creator_yield_percentage: u8,
//         pub accumulated_protocol_yield: u64,
//         pub accumulated_creator_yield: u64,
//     }

//     impl StablecoinData {
//         pub const SIZE: usize = 8 +  // discriminator
//             32 +  // creator
//             32 +  // stablebond_mint
//             32 +  // oracle
//             4 + MAX_NAME_LENGTH +  // name
//             4 + MAX_SYMBOL_LENGTH +  // symbol
//             4 + MAX_ICON_URL_LENGTH +  // icon_url
//             4 + MAX_CURRENCY_LENGTH +  // target_currency
//             1 +  // decimals
//             8 +  // total_supply
//             8 +  // total_stablebonds
//             8 +  // creation_time
//             8 +  // last_yield_collection
//             1 +  // creator_yield_percentage
//             8 +  // accumulated_protocol_yield
//             8;   // accumulated_creator_yield
//     }

//     // Helper Functions
//     fn get_oracle_feed(currency: &str) -> Result<Pubkey> {
//         for &(curr, feed) in ORACLE_FEEDS {
//             if curr == currency {
//                 return Ok(Pubkey::from_str(feed).unwrap());
//             }
//         }
//         Err(error!(ErrorCode::InvalidCurrency))
//     }

//     fn is_oracle_stale(oracle_data: &AggregatorAccountData) -> Result<bool> {
//         let staleness = Clock::get()?.unix_timestamp - oracle_data.latest_confirmed_round.round_open_timestamp;
//         Ok(staleness > MAX_ORACLE_STALENESS)
//     }

//     fn calculate_stablebond_yield(
//         ctx: &EtherfuseYieldContext,
//         total_stablebonds: u64,
//         last_collection: i64,
//         current_time: i64,
//     ) -> Result<u64> {
//         let yield_calculator = YieldCalculator::new(
//             &ctx.etherfuse_program,
//             &ctx.yield_data_account,
//             &ctx.stablebond_mint,
//         )?;
        
//         // Get the current APY from Etherfuse
//         let current_apy = yield_calculator.get_current_apy()?;
        
//         // Calculate time elapsed in seconds
//         let time_elapsed = (current_time - last_collection) as u64;
        
//         // Calculate yield using actual APY
//         let seconds_per_year = 365 * 24 * 60 * 60;
//         let yield_amount = (total_stablebonds as u128)
//             .checked_mul(current_apy as u128)
//             .ok_or(ErrorCode::CalculationOverflow)?
//             .checked_mul(time_elapsed as u128)
//             .ok_or(ErrorCode::CalculationOverflow)?
//             .checked_div(seconds_per_year as u128)
//             .ok_or(ErrorCode::CalculationOverflow)?
//             .checked_div(100u128)
//             .ok_or(ErrorCode::CalculationOverflow)?;
            
//         Ok(yield_amount as u64)
//     }

//     // Events
//     #[event]
//     pub struct StablecoinCreated {
//         pub creator: Pubkey,
//         pub mint: Pubkey,
//         pub name: String,
//         pub symbol: String,
//         pub target_currency: String,
//     }

//     #[event]
//     pub struct TokensMinted {
//         pub user: Pubkey,
//         pub amount: u64,
//         pub stablebond_amount: u64,
//     }

//     #[event]
//     pub struct TokensRedeemed {
//         pub user: Pubkey,
//         pub amount: u64,
//         pub stablebond_amount: u64,
//     }

//     #[event]
//     pub struct YieldCollected {
//         pub stablecoin: Pubkey,
//         pub total_yield: u64,
//         pub creator_share: u64,
//         pub protocol_share: u64,
//     }

//     #[event]
//     pub struct YieldWithdrawn {
//         pub stablecoin: Pubkey,
//         pub amount: u64,
//         pub recipient: Pubkey,
//         pub yield_type: String,
//     }

//     // Error Codes
//     #[error_code]
//     pub enum ErrorCode {
//         #[msg("Calculation overflow occurred")]
//         CalculationOverflow,
        
//         #[msg("Invalid stablebond mint")]
//         InvalidStablebondMint,
        
//         #[msg("Invalid decimals (must be <= 9)")]
//         InvalidDecimals,
        
//         #[msg("Invalid name (must be <= 32 chars)")]
//         InvalidName,
        
//         #[msg("Invalid symbol (must be <= 8 chars)")]
//         InvalidSymbol,
        
//         #[msg("Invalid icon URL (must be <= 128 chars)")]
//         InvalidIconUrl,
        
//         #[msg("Invalid currency")]
//         InvalidCurrency,
        
//         #[msg("Invalid oracle data")]
//         InvalidOracleData,
        
//         #[msg("Invalid exchange rate")]
//         InvalidExchangeRate,
        
//         #[msg("Slippage tolerance exceeded")]
//         SlippageExceeded,
        
//         #[msg("Oracle data is stale")]
//         StaleOracle,
        
//         #[msg("Invalid yield percentage (must be 0-100)")]
//         InvalidYieldPercentage,
        
//         #[msg("Yield collection too early")]
//         YieldCollectionTooEarly,
        
//         #[msg("Insufficient yield for withdrawal")]
//         InsufficientYield,
        
//         #[msg("Unauthorized")]
//         Unauthorized,

//         #[msg("Failed to fetch Etherfuse yield rate")]
//         EtherfuseYieldFetchError,
        
//         #[msg("Invalid Etherfuse program")]
//         InvalidEtherfuseProgram,
//     }
//     // Error Codes
//     #[error_code]
//     pub enum ErrorCode {
//         #[msg("Calculation overflow occurred")]
//         CalculationOverflow,
        
//         #[msg("Invalid stablebond mint")]
//         InvalidStablebondMint,
        
//         #[msg("Invalid decimals (must be <= 9)")]
//         InvalidDecimals,
        
//         #[msg("Invalid name (must be <= 32 chars)")]
//         InvalidName,
        
//         #[msg("Invalid symbol (must be <= 8 chars)")]
//         InvalidSymbol,
        
//         #[msg("Invalid icon URL (must be <= 128 chars)")]
//         InvalidIconUrl,
        
//         #[msg("Invalid currency")]
//         InvalidCurrency,
        
//         #[msg("Invalid oracle data")]
//         InvalidOracleData,
        
//         #[msg("Invalid exchange rate")]
//         InvalidExchangeRate,
        
//         #[msg("Slippage tolerance exceeded")]
//         SlippageExceeded,
        
//         #[msg("Oracle data is stale")]
//         StaleOracle,
        
//         #[msg("Invalid yield percentage (must be 0-100)")]
//         InvalidYieldPercentage,
        
//         #[msg("Yield collection too early")]
//         YieldCollectionTooEarly,
        
//         #[msg("Insufficient yield for withdrawal")]
//         InsufficientYield,
        
//         #[msg("Unauthorized")]
//         Unauthorized,

//         #[msg("Failed to fetch Etherfuse yield rate")]
//         EtherfuseYieldFetchError,
        
//         #[msg("Invalid Etherfuse program")]
//         InvalidEtherfuseProgram,
//     }









//from the lib.rs default code 
// use anchor_lang::prelude::*;

// declare_id!("5z7aQhR2UWKLPdmaCGU9exZF1JiqsanYFZQHxVVdYByX");

// #[program]
// pub mod stablefun {
//     use super::*;

//     pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
//         msg!("Greetings from: {:?}", ctx.program_id);
//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct Initialize {}


