import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EudoxTokenService } from '../../blockchain/services/eudox-token.service';
import { PrismaService } from '../../../common/services/prisma.service';
import { 
  CostEstimationRequestDto, 
  CostEstimationResponseDto,
  LocationDto,
  MedicineCostDto,
  HealthcareFacilityDto 
} from '../dtos/cost-estimation.dto';
import axios from 'axios';

@Injectable()
export class CostEstimationService {
  private readonly logger = new Logger(CostEstimationService.name);
  private readonly COST_ESTIMATION_FEE = 10;
  private readonly deepseekApiKey: string;
  private readonly deepseekApiUrl: string;

  constructor(
    private configService: ConfigService,
    private eudoxTokenService: EudoxTokenService,
    private prisma: PrismaService,
  ) {
    this.deepseekApiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    this.deepseekApiUrl = this.configService.get<string>('DEEPSEEK_API_URL');
  }

  async estimateCosts(request: CostEstimationRequestDto): Promise<CostEstimationResponseDto> {
    try {
      // Check token balance
      const balance = await this.eudoxTokenService.getTokenBalance(request.walletAddress);
      if (balance < this.COST_ESTIMATION_FEE) {
        throw new HttpException(
          'Insufficient EUDOX tokens for cost estimation',
          HttpStatus.PAYMENT_REQUIRED
        );
      }

      // Get health analysis from database
      const healthAnalysis = await this.prisma.healthAnalysis.findUnique({
        where: { id: request.healthAnalysisId },
        select: {
          id: true,
          description: true,
          diagnosis: true,
        }
      });

      if (!healthAnalysis) {
        throw new HttpException('Health analysis not found', HttpStatus.NOT_FOUND);
      }

      // Get cost estimation from Deepseek
      const costEstimation = await this.getDeepseekCostEstimation(
        healthAnalysis,
        request.location
      );

      // Convert all DTOs to plain objects for database storage
      const dbData = {
        healthAnalysisId: request.healthAnalysisId,
        location: {
          latitude: request.location.latitude,
          longitude: request.location.longitude
        },
        medicines: costEstimation.medicines.map(medicine => ({
          name: medicine.name,
          dosage: medicine.dosage,
          estimatedPrice: {
            fiat: {
              amount: medicine.estimatedPrice.fiat.amount,
              currency: medicine.estimatedPrice.fiat.currency
            },
            eudox: {
              amount: medicine.estimatedPrice.eudox.amount
            }
          }
        })),
        facilities: costEstimation.nearbyFacilities.map(facility => ({
          name: facility.name,
          type: facility.type,
          distance: facility.distance,
          location: {
            latitude: facility.location.latitude,
            longitude: facility.location.longitude,
            address: facility.location.address
          },
          consultationFee: {
            fiat: {
              amount: facility.consultationFee.fiat.amount,
              currency: facility.consultationFee.fiat.currency
            },
            eudox: {
              amount: facility.consultationFee.eudox.amount
            }
          }
        })),
        totalCost: {
          fiat: {
            amount: costEstimation.totalEstimatedCost.fiat.amount,
            currency: costEstimation.totalEstimatedCost.fiat.currency
          },
          eudox: {
            amount: costEstimation.totalEstimatedCost.eudox.amount
          }
        }
      };

      // Store cost estimation in database
      const savedEstimation = await this.prisma.costEstimation.create({
        data: dbData
      });

      // Charge tokens
      const serviceWalletAddress = this.configService.get<string>('SERVICE_WALLET_ADDRESS');
      await this.eudoxTokenService.transferTokens(
        request.walletAddress,
        serviceWalletAddress,
        this.COST_ESTIMATION_FEE
      );

      return costEstimation;
    } catch (error) {
      this.logger.error('Error in cost estimation:', error);
      throw error;
    }
  }

  private async getDeepseekCostEstimation(
    healthAnalysis: any,
    location: any
  ): Promise<CostEstimationResponseDto> {
    try {
      const prompt = this.buildPrompt(healthAnalysis, location);
      
      const response = await axios.post(
        this.deepseekApiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a healthcare cost estimation expert. Provide detailed cost estimates for medicines and healthcare facilities.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.deepseekApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.parseResponse(response.data.choices[0].message.content);
    } catch (error) {
      this.logger.error('Deepseek API error:', error);
      throw new HttpException('Failed to get cost estimation', HttpStatus.BAD_GATEWAY);
    }
  }

  private buildPrompt(healthAnalysis: any, location: any): string {
    return `
      Based on the following health analysis and location, provide detailed cost estimates:

      Health Analysis:
      Description: ${healthAnalysis.description}
      Diagnosis: ${healthAnalysis.diagnosis}
      Conditions: ${JSON.stringify(healthAnalysis.conditions)}

      Location:
      Latitude: ${location.latitude}
      Longitude: ${location.longitude}

      Please provide:
      1. Medicine costs with dosage
      2. Nearby healthcare facilities with consultation fees
      3. Total cost estimation in USD and EUDOX tokens
    `;
  }

  private parseResponse(response: string): CostEstimationResponseDto {
    try {
      // Parse and format the AI response
      const parsedResponse = JSON.parse(response);
      return {
        medicines: parsedResponse.medicines || [],
        nearbyFacilities: parsedResponse.nearbyFacilities || [],
        totalEstimatedCost: parsedResponse.totalEstimatedCost || {
          fiat: { amount: 0, currency: 'USD' },
          eudox: { amount: 0 }
        }
      };
    } catch (error) {
      throw new HttpException('Failed to parse cost estimation', HttpStatus.BAD_GATEWAY);
    }
  }
}