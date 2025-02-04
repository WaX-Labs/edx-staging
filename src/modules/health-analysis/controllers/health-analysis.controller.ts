import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthAnalysisService } from '../services/health-analysis.service';
import { HealthAnalysisRequestDto } from '../dtos/health-analysis.request.dto';
import { HealthAnalysisResponseDto } from '../dtos/health-analysis.response.dto';

@ApiTags('Health Analysis')
@Controller('health-analysis')
export class HealthAnalysisController {
  constructor(
    private readonly healthAnalysisService: HealthAnalysisService,
  ) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze health condition and find matching ICD codes' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns analysis and matching ICD codes',
    type: HealthAnalysisResponseDto
  })
  async analyzeHealth(
    @Body() dto: HealthAnalysisRequestDto
  ): Promise<HealthAnalysisResponseDto> {
    return this.healthAnalysisService.analyzeHealthCondition(dto.description);
  }
}