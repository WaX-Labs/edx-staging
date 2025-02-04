import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HealthAnalysisRequestDto {
  @ApiProperty({
    example: "I've been having severe headaches and feeling dizzy for the past week",
    description: 'User description of their health condition'
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}