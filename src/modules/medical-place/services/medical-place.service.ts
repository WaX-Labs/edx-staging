import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/services/prisma.service';
import axios, { AxiosError } from 'axios';
import { MedicalPlaceResponseDto } from '../dtos/medical-place.response.dtos';
import { MedicalPlaceRequestDto } from '../dtos/medical-place.request.dtos';

@Injectable()
export class MedicalPlaceService {
  private readonly logger = new Logger(MedicalPlaceService.name);
  private readonly deepseekApiKey: string;
  private readonly deepseekApiUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.deepseekApiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    this.deepseekApiUrl = 'https://api.deepseek.com/v1/chat/completions';

    // Validate API key exists
    if (!this.deepseekApiKey) {
      this.logger.error('DEEPSEEK_API_KEY is not configured');
    }
  }

  private cleanJsonResponse(content: string): string {
    // Extract just the recommendedFacilities array from the response
    const match = content.match(/"recommendedFacilities":\s*(\[[\s\S]*?\])/);
    if (!match) {
      return '[]'; // Return empty array if no match found
    }
    return match[1]
      .replace(/```json\n/, '')
      .replace(/\n```$/, '')
      .trim();
  }

  private async analyzeWithDeepseek(
    icdCode: string,
    lat?: string,
    long?: string,
  ): Promise<any> {
    try {
      this.logger.debug(
        `Analyzing description: ${icdCode}, lat: ${lat}, long: ${long}`,
      );

      if (!this.deepseekApiKey) {
        throw new HttpException(
          'Deepseek API key not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const response = await axios.post(
        this.deepseekApiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: `As a medical expert, analyze the following patient condition and find 5 nearby medical facilities:
              ICD Code: "${icdCode}"
              Location: ${lat ? `Latitude ${lat}, Longitude ${long}` : 'Not provided'}
              
              Format the response as:
              
                "recommendedFacilities": [
                  {
                    "name": "facility name",
                    "type": "hospital/clinic",
                    "distance": "distance in km",
                    "location": {
                      "latitude": "facility lat",
                      "longitude": "facility long"
                    },
                    "estimatedCost": {
                      "consultation": "cost range",
                      "treatment": "cost range"
                    }
                  }
                  // Repeat for 5 facilities total
                ],
            `,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000, // Increased token limit to accommodate more facilities
        },
        {
          headers: {
            Authorization: `Bearer ${this.deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.debug('Deepseek API Response:', response.data);

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new HttpException(
          'Invalid response from Deepseek API',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const content = response.data.choices[0].message.content;
      const cleanedContent = this.cleanJsonResponse(content);

      console.log('cleanedContent', cleanedContent);

      try {
        // Validate response structure and ensure 10 facilities
        if (cleanedContent.length < 10) {
          throw new HttpException(
            'Invalid response format from Deepseek API - expected 10 facilities',
            HttpStatus.BAD_GATEWAY,
          );
        }

        return cleanedContent;
      } catch (parseError) {
        this.logger.error('Failed to parse cleaned content:', cleanedContent);
        throw new HttpException(
          'Failed to parse Deepseek API response',
          HttpStatus.BAD_GATEWAY,
        );
      }
    } catch (error) {
      this.logger.error('Error in analyzeWithDeepseek:', error);
      throw error;
    }
  }

  async analyzeMedicalPlace(
    dto: MedicalPlaceRequestDto,
  ): Promise<any> {
    try {
      const aiAnalysis = await this.analyzeWithDeepseek(
        dto.icdCode,
        dto.lat,
        dto.long,
      );
      console.log('aiAnalysis', aiAnalysis);
      const parsedResponse = JSON.parse(aiAnalysis);
      return parsedResponse;
    } catch (error) {
      this.logger.error('Error in analyzeMedicalPlace:', error);
      throw error;
    }
  }

  //   async saveHistory(dto: any): Promise<History> {
  //     return this.prisma.history.create({
  //       data: dto,
  //     });
  //   }
}
