import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenController } from './controllers/token.controller';
import { EudoxTokenService } from './services/eudox-token.service';
import { SolanaService } from './services/solana.service';

@Module({
  imports: [ConfigModule],
  controllers: [TokenController],
  providers: [EudoxTokenService, SolanaService],
  exports: [EudoxTokenService, SolanaService],
})
export class BlockchainModule {}