import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PublicKey, Keypair } from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount, 
  getAccount, 
  transfer,
  Account
} from '@solana/spl-token';
import { SolanaService } from './solana.service';
import bs58 from 'bs58';

@Injectable()
export class EudoxTokenService {
  private readonly logger = new Logger(EudoxTokenService.name);
  private readonly tokenMint: PublicKey;
  private readonly payerKeypair: Keypair;

  constructor(
    private configService: ConfigService,
    private solanaService: SolanaService,
  ) {
    const tokenMintValue = this.configService.get<string>('EUDOX_TOKEN_MINT');
    const privateKeyBase58 = this.configService.get<string>('WALLET_PRIVATE_KEY');

    console.log('Token Mint:', tokenMintValue);
    console.log('Private Key Base58:', privateKeyBase58);

    if (!tokenMintValue) {
      throw new Error('EUDOX_TOKEN_MINT not configured');
    }
    if (!privateKeyBase58) {
      throw new Error('WALLET_PRIVATE_KEY not configured');
    }

    this.tokenMint = new PublicKey(tokenMintValue);
    const privateKeyBytes = bs58.decode(privateKeyBase58);
    this.payerKeypair = Keypair.fromSecretKey(privateKeyBytes);
  }

  private getKeypairFromPrivateKey(privateKey: string): Keypair {
    try {
      const privateKeyBytes = Buffer.from(JSON.parse(privateKey));
      return Keypair.fromSecretKey(privateKeyBytes);
    } catch (error) {
      this.logger.error(`Invalid private key format: ${error.message}`);
      throw new HttpException('Invalid private key format', HttpStatus.BAD_REQUEST);
    }
  }

  async getTokenBalance(walletAddress: string): Promise<number> {
    try {
      const connection = await this.solanaService.getConnection();
      const walletPubkey = new PublicKey(walletAddress);
      
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        this.payerKeypair, // Use payer keypair for transaction fees
        this.tokenMint,
        walletPubkey
      );

      const accountInfo = await getAccount(connection, tokenAccount.address);
      return Number(accountInfo.amount) / Math.pow(10, 9);
    } catch (error) {
      this.logger.error(`Error getting token balance: ${error.message}`);
      throw new HttpException(
        'Failed to get token balance',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async transferTokens(
    fromPrivateKey: string,
    toAddress: string,
    amount: number
  ): Promise<string> {
    try {
      const connection = await this.solanaService.getConnection();
      
      // Get keypair from private key
      const fromKeypair = this.getKeypairFromPrivateKey(fromPrivateKey);
      const toPublicKey = new PublicKey(toAddress);
      
      // Convert amount to token units (considering 9 decimals)
      const tokenAmount = amount * Math.pow(10, 9);

      // Get or create token accounts
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair, // Signer for from account
        this.tokenMint,
        fromKeypair.publicKey
      );

      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair, // Signer for creating to account if needed
        this.tokenMint,
        toPublicKey
      );

      // Transfer tokens
      const signature = await transfer(
        connection,
        fromKeypair, // Signer for transaction
        fromTokenAccount.address,
        toTokenAccount.address,
        fromKeypair.publicKey,
        tokenAmount
      );

      return signature;
    } catch (error) {
      this.logger.error(`Error transferring tokens: ${error.message}`);
      throw new HttpException(
        'Failed to transfer tokens',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getTokenPrice(): Promise<number> {
    // Implement price fetching from your chosen DEX or price oracle
    // This is a placeholder
    return 1.0;
  }
}