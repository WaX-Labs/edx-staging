import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class LocationDto {
  @ApiProperty({ example: "-6.2088", description: "Latitude" })
  @IsString()
  @IsNotEmpty()
  latitude: string;

  @ApiProperty({ example: "106.8456", description: "Longitude" })
  @IsString()
  @IsNotEmpty()
  longitude: string;
}

export class CostEstimationRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  healthAnalysisId: string;

  @ApiProperty()
  @IsNotEmpty()
  location: LocationDto;

  @ApiProperty({ description: "Wallet address for token payment" })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}

export class MedicineCostDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  dosage: string;

  @ApiProperty()
  estimatedPrice: {
    fiat: {
      amount: number;
      currency: string;
    };
    eudox: {
      amount: number;
    };
  };
}

export class HealthcareFacilityDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  distance: number;

  @ApiProperty()
  location: {
    latitude: string;
    longitude: string;
    address: string;
  };

  @ApiProperty()
  consultationFee: {
    fiat: {
      amount: number;
      currency: string;
    };
    eudox: {
      amount: number;
    };
  };
}

export class CostEstimationResponseDto {
  @ApiProperty({ type: [MedicineCostDto] })
  medicines: MedicineCostDto[];

  @ApiProperty({ type: [HealthcareFacilityDto] })
  nearbyFacilities: HealthcareFacilityDto[];

  @ApiProperty()
  totalEstimatedCost: {
    fiat: {
      amount: number;
      currency: string;
    };
    eudox: {
      amount: number;
    };
  };
}