import { Module } from '@nestjs/common';
import { HealthAnalysisController } from './controllers/health-analysis.controller';
import { HealthAnalysisService } from './services/health-analysis.service';
import { PrismaService } from 'src/common/services/prisma.service';

@Module({
  controllers: [HealthAnalysisController],
  providers: [HealthAnalysisService, PrismaService],
  exports: [HealthAnalysisService],
})
export class HealthAnalysisModule {}