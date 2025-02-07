import { Module } from '@nestjs/common';
import { MedicalPlaceController } from './controllers/medical-place.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { MedicalPlaceService } from './services/medical-place.service';
@Module({
  controllers: [MedicalPlaceController],
  providers: [MedicalPlaceService, PrismaService],
  exports: [MedicalPlaceService],
})
export class MedicalPlaceModule {}