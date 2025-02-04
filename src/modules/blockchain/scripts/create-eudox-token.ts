import { 
    Connection, 
    Keypair, 
    PublicKey, 
    sendAndConfirmTransaction, 
    Transaction 
  } from '@solana/web3.js';
  import { 
    createMint, 
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_PROGRAM_ID,
  } from '@solana/spl-token';
  import * as dotenv from 'dotenv';
  import fs from 'fs';
  import bs58 from 'bs58';
  
  dotenv.config();
  
  async function createEudoxToken() {
    // Connection to Solana network
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
  
    try {
      // Load keypair from Base58 private key
      let payer: Keypair;
      if (process.env.WALLET_PRIVATE_KEY) {
        const privateKeyBytes = bs58.decode(process.env.WALLET_PRIVATE_KEY);
        payer = Keypair.fromSecretKey(privateKeyBytes);
      } else {
        payer = Keypair.generate();
        // Save keypair for future use
        fs.writeFileSync(
          'eudox-keypair.json',
          JSON.stringify(Array.from(payer.secretKey))
        );
      }
  
      console.log('Creating token with authority:', payer.publicKey.toString());
  
      // Create mint account
      const mint = await createMint(
        connection,
        payer,
        payer.publicKey,    // Mint authority
        payer.publicKey,    // Freeze authority
        9,                  // Decimals (standard for Solana tokens)
      );
  
      console.log('Token Mint created:', mint.toString());
  
      // Get the token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
      );
  
      console.log('Token Account:', tokenAccount.address.toString());
  
      // Mint 1 million tokens (considering 9 decimals)
      const totalSupply = 1_000_000 * Math.pow(10, 9); // 1M tokens with 9 decimals
      await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        payer,
        totalSupply
      );
  
      console.log('Successfully minted 1,000,000 EUDOX tokens');
  
      // Save token information
      const tokenInfo = {
        mint: mint.toString(),
        tokenAccount: tokenAccount.address.toString(),
        authority: payer.publicKey.toString(),
        totalSupply: '1,000,000',
        decimals: 9,
      };
  
      fs.writeFileSync(
        'eudox-token-info.json',
        JSON.stringify(tokenInfo, null, 2)
      );
  
      console.log('Token information saved to eudox-token-info.json');
      return tokenInfo;
  
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  }
  
  // Run the token creation
  createEudoxToken()
    .then((tokenInfo) => {
      console.log('EUDOX Token created successfully!');
      console.log('Token Info:', tokenInfo);
    })
    .catch((error) => {
      console.error('Failed to create token:', error);
      process.exit(1);
    });