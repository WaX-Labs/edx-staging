import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CostEstimationService } from '../services/cost-estimation.service';
import { 
  CostEstimationRequestDto, 
  CostEstimationResponseDto 
} from '../dtos/cost-estimation.dto';

@ApiTags('Cost Estimation')
@Controller('cost-estimation')
export class CostEstimationController {
  constructor(
    private readonly costEstimationService: CostEstimationService
  ) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Get cost estimation for health condition (costs 10 EUDOX tokens)' })
  @ApiResponse({
    status: 200,
    description: 'Returns cost estimates for medicines and healthcare facilities',
    type: CostEstimationResponseDto
  })
  async getCostEstimation(
    @Body() request: CostEstimationRequestDto
  ): Promise<CostEstimationResponseDto> {
    return this.costEstimationService.estimateCosts(request);
  }
}