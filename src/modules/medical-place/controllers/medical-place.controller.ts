import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MedicalPlaceRequestDto } from '../dtos/medical-place.request.dtos';
import { MedicalPlaceResponseDto } from '../dtos/medical-place.response.dtos';
import { MedicalPlaceService } from '../services/medical-place.service';
@ApiTags('Medical Place')
@Controller('medical-place')
export class MedicalPlaceController {
  constructor(
    private readonly medicalPlaceService: MedicalPlaceService,
  ) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze medical place and find matching ICD codes' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns analysis and matching ICD codes',
  })
  async analyzeMedicalPlace(
    @Body() dto: MedicalPlaceRequestDto
  ): Promise<any> {
    return this.medicalPlaceService.analyzeMedicalPlace(dto);
  }
}
