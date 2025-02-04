import configs from '../config';
import { Global, Module } from '@nestjs/common';
import { ICD10Module } from '../modules/icd10/icd10.module';
import { HealthAnalysisModule } from 'src/modules/health-analysis/health-analysis.module';
import { PrismaService } from './services/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  controllers: [],
  imports: [
    ICD10Module,
    HealthAnalysisModule,
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class CommonModule {}
