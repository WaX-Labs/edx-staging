import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private readonly connection: Connection;

  constructor(private configService: ConfigService) {
    this.connection = new Connection(
      this.configService.get<string>('SOLANA_RPC_URL'),
      'confirmed'
    );
  }

  async getConnection(): Promise<Connection> {
    return this.connection;
  }

  async getBalance(publicKey: string): Promise<number> {
    try {
      const balance = await this.connection.getBalance(new PublicKey(publicKey));
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      this.logger.error(`Error getting balance: ${error.message}`);
      throw error;
    }
  }

  validateAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }
}