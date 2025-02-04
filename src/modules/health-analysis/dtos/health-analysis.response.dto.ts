import { ApiProperty } from '@nestjs/swagger';

class ConditionAnalysis {
  @ApiProperty()
  condition: string;

  @ApiProperty()
  icdCode: string;

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  reasoning: string;

  @ApiProperty()
  icdDetails?: {
    code: string;
    display: string;
  };
}

export class HealthAnalysisResponseDto {
  @ApiProperty()
  analysis: string;

  @ApiProperty({ type: [ConditionAnalysis] })
  possibleConditions: ConditionAnalysis[];
}