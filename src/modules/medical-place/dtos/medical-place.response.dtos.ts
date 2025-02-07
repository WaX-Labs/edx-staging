import { ApiProperty } from '@nestjs/swagger';

class Location {
  @ApiProperty({
    example: "37.7749",
    description: "Facility latitude coordinate"
  })
  latitude: string;

  @ApiProperty({
    example: "-122.4194", 
    description: "Facility longitude coordinate"
  })
  longitude: string;
}

class EstimatedCost {
  @ApiProperty({
    example: "$100-200",
    description: "Estimated cost range for consultation"
  })
  consultation: string;

  @ApiProperty({
    example: "$500-1000",
    description: "Estimated cost range for treatment"
  })
  treatment: string;
}

class RecommendedFacility {
  @ApiProperty({
    example: "San Francisco General Hospital",
    description: "Name of the medical facility"
  })
  name: string;

  @ApiProperty({
    example: "hospital",
    description: "Type of medical facility"
  })
  type: string;

  @ApiProperty({
    example: ["Emergency Medicine", "Neurology"],
    description: "Medical specialties available"
  })
  specialties: string[];

  @ApiProperty({
    example: "2.5",
    description: "Distance to facility in kilometers"
  })
  distance: string;

  @ApiProperty({
    type: Location,
    description: "Facility location coordinates"
  })
  location: Location;

  @ApiProperty({
    type: EstimatedCost,
    description: "Estimated costs for services"
  })
  estimatedCost: EstimatedCost;
}

class PossibleCondition {
  @ApiProperty({
    example: "Migraine",
    description: "Name of the possible medical condition"
  })
  condition: string;

  @ApiProperty({
    example: "G43.9",
    description: "ICD-10 code for the condition"
  })
  icdCode: string;

  @ApiProperty({
    example: 0.85,
    description: "Confidence score for this diagnosis"
  })
  confidence: number;

  @ApiProperty({
    example: "Symptoms match typical migraine presentation",
    description: "Reasoning for this possible diagnosis"
  })
  reasoning: string;
}

export class MedicalPlaceResponseDto {
  @ApiProperty({
    example: "Patient presents with symptoms consistent with migraine...",
    description: "Brief analysis of the medical condition"
  })
  analysis: string;

  @ApiProperty({
    type: [RecommendedFacility],
    description: "List of recommended medical facilities"
  })
  recommendedFacilities: RecommendedFacility[];

  @ApiProperty({
    type: [PossibleCondition],
    description: "List of possible medical conditions"
  })
  possibleConditions: PossibleCondition[];
}