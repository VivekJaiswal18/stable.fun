// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { Stablefun } from "../target/types/stablefun";

// describe("stablefun", () => {
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.AnchorProvider.env());

//   const program = anchor.workspace.Stablefun as Program<Stablefun>;

//   it("Is initialized!", async () => {
//     // Add your test here.
//     const tx = await program.methods.initialize().rpc();
//     console.log("Your transaction signature", tx);
//   });
// });


import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Stablefun } from "../target/types/stablefun";
import {
  TOKEN_PROGRAM_ID,
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { assert } from "chai";

describe("stablefun", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Stablefun as Program<Stablefun>;
  
  // Test data
  const name = "Test Stable";
  const symbol = "TST";
  const decimals = 9;
  const iconUrl = "https://example.com/icon.png";
  const targetCurrency = "USD";
  
  // Test accounts
  let stablecoinMint: PublicKey;
  let stablebondMint: PublicKey;
  let stablecoinData: PublicKey;
  let userTokenAccount: PublicKey;
  let userStablebondAccount: PublicKey;
  let programStablebondAccount: PublicKey;
  let oracleFeed: PublicKey;
  
  // Test keypairs
  const creator = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();

  before(async () => {
    // Airdrop SOL to creator and user
    const signature = await provider.connection.requestAirdrop(
      creator.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    const userSig = await provider.connection.requestAirdrop(
      user.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(userSig);

    // Create mints and other necessary accounts
    stablebondMint = await createMint(provider, creator.publicKey);
    stablecoinMint = await createMint(provider, creator.publicKey);
    
    // Create associated token accounts
    userTokenAccount = await createAssociatedTokenAccount(
      provider,
      stablecoinMint,
      user.publicKey
    );
    
    userStablebondAccount = await createAssociatedTokenAccount(
      provider,
      stablebondMint,
      user.publicKey
    );
    
    programStablebondAccount = await createAssociatedTokenAccount(
      provider,
      stablebondMint,
      program.programId
    );

    // Get oracle feed for USD
    oracleFeed = new PublicKey("Frkcq8bWREur6hRrtGZidPDn1P3Byi8fjbJxfiJvRWFB");
  });

  it("Creates a new stablecoin", async () => {
    // Generate PDA for stablecoin data
    const [stablecoinDataPda] = await PublicKey.findProgramAddress(
      [Buffer.from("stablecoin"), creator.publicKey.toBuffer()],
      program.programId
    );
    stablecoinData = stablecoinDataPda;

    try {
      await program.methods
        .createStablecoin(
          name,
          symbol,
          decimals,
          iconUrl,
          targetCurrency
        )
        .accounts({
          creator: creator.publicKey,
          stablecoinData: stablecoinData,
          stablecoinMint: stablecoinMint,
          stablebondMint: stablebondMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([creator])
        .rpc();

      // Fetch and verify the created stablecoin data
      const stablecoinAccount = await program.account.stablecoinData.fetch(
        stablecoinData
      );
      
      assert.equal(stablecoinAccount.name, name);
      assert.equal(stablecoinAccount.symbol, symbol);
      assert.equal(stablecoinAccount.decimals, decimals);
      assert.equal(stablecoinAccount.iconUrl, iconUrl);
      assert.equal(stablecoinAccount.targetCurrency, targetCurrency);
      assert.equal(stablecoinAccount.totalSupply.toNumber(), 0);
      assert.equal(stablecoinAccount.totalStablebonds.toNumber(), 0);
    } catch (error) {
      console.error("Error creating stablecoin:", error);
      throw error;
    }
  });

  it("Mints tokens", async () => {
    const stablebondAmount = new anchor.BN(1000000000); // 1 token with 9 decimals
    const minimumTokensOut = new anchor.BN(900000000); // Minimum expected output

    try {
      await program.methods
        .mintTokens(stablebondAmount, minimumTokensOut)
        .accounts({
          user: user.publicKey,
          creator: creator.publicKey,
          stablecoinData: stablecoinData,
          stablecoinMint: stablecoinMint,
          stablebondMint: stablebondMint,
          userTokenAccount: userTokenAccount,
          userStablebondAccount: userStablebondAccount,
          programStablebondAccount: programStablebondAccount,
          oracleFeed: oracleFeed,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

      // Verify the minted tokens
      const userTokenBalance = await provider.connection.getTokenAccountBalance(
        userTokenAccount
      );
      assert(userTokenBalance.value.uiAmount > 0);

      // Verify updated stablecoin data
      const stablecoinAccount = await program.account.stablecoinData.fetch(
        stablecoinData
      );
      assert(stablecoinAccount.totalSupply.toNumber() > 0);
      assert(stablecoinAccount.totalStablebonds.toNumber() > 0);
    } catch (error) {
      console.error("Error minting tokens:", error);
      throw error;
    }
  });

  it("Redeems tokens", async () => {
    const tokenAmount = new anchor.BN(500000000); // 0.5 tokens with 9 decimals
    const minimumStablebondsOut = new anchor.BN(450000000); // Minimum expected output

    try {
      await program.methods
        .redeemTokens(tokenAmount, minimumStablebondsOut)
        .accounts({
          user: user.publicKey,
          creator: creator.publicKey,
          stablecoinData: stablecoinData,
          stablecoinMint: stablecoinMint,
          stablebondMint: stablebondMint,
          userStablebondAccount: userStablebondAccount,
          programStablebondAccount: programStablebondAccount,
          userTokenAccount: userTokenAccount,
          oracleFeed: oracleFeed,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

      // Verify the redeemed tokens
      const userTokenBalance = await provider.connection.getTokenAccountBalance(
        userTokenAccount
      );
      assert(userTokenBalance.value.uiAmount < 1);

      // Verify updated stablecoin data
      const stablecoinAccount = await program.account.stablecoinData.fetch(
        stablecoinData
      );
      assert(stablecoinAccount.totalSupply.toNumber() < 1000000000);
    } catch (error) {
      console.error("Error redeeming tokens:", error);
      throw error;
    }
  });

  it("Gets yield information", async () => {
    const amount = new anchor.BN(1000000000); // 1 token with 9 decimals

    try {
      const yieldInfo = await program.methods
        .getYieldInfo(amount)
        .accounts({
          stablebondMint: stablebondMint,
        })
        .view();

      // Verify yield info
      assert(yieldInfo.apy > 0);
      assert(yieldInfo.totalValue.toNumber() >= amount.toNumber());
      assert.equal(yieldInfo.initialDeposit.toNumber(), amount.toNumber());
      assert(yieldInfo.earnedYield.toNumber() >= 0);
    } catch (error) {
      console.error("Error getting yield info:", error);
      throw error;
    }
  });
});

// Helper functions
async function createMint(
  provider: anchor.AnchorProvider,
  authority: PublicKey
): Promise<PublicKey> {
  const token = await Token.createMint(
    provider.connection,
    provider.wallet.payer,
    authority,
    null,
    9,
    TOKEN_PROGRAM_ID
  );
  return token.publicKey;
}

async function createAssociatedTokenAccount(
  provider: anchor.AnchorProvider,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const token = new Token(
    provider.connection,
    mint,
    TOKEN_PROGRAM_ID,
    provider.wallet.payer
  );
  return await token.createAssociatedTokenAccount(owner);
}