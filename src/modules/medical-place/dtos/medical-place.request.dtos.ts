import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MedicalPlaceRequestDto {
  @ApiProperty({
    example: "R51",
    description: 'ICD-10 code for the medical condition'
  })
  @IsString()
  @IsNotEmpty()
  icdCode: string;

  @ApiProperty({
    example: "37.7749",
    description: 'Latitude coordinate'
  })
  @IsString()
  @IsNotEmpty()
  lat: string;

  @ApiProperty({
    example: "-122.4194",
    description: 'Longitude coordinate'
  })
  @IsString()
  @IsNotEmpty()
  long: string;

  @ApiProperty({
    example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    description: 'Ethereum wallet address'
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}