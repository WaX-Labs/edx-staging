import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CostEstimationController } from './controllers/cost-estimation.controller';
import { CostEstimationService } from './services/cost-estimation.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  imports: [
    ConfigModule,
    BlockchainModule,
  ],
  controllers: [CostEstimationController],
  providers: [CostEstimationService, PrismaService],
  exports: [CostEstimationService],
})
export class CostEstimationModule {}