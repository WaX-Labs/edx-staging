import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/services/prisma.service';
import axios, { AxiosError } from 'axios';
import { HealthAnalysisResponseDto } from '../dtos/health-analysis.response.dto';

@Injectable()
export class HealthAnalysisService {
  private readonly logger = new Logger(HealthAnalysisService.name);
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
    return content
      .replace(/```json\n/, '')  // Remove opening ```json
      .replace(/\n```$/, '')     // Remove closing ```
      .trim();                   // Remove any extra whitespace
  }

  private async analyzeWithDeepseek(description: string): Promise<HealthAnalysisResponseDto> {
    try {
      this.logger.debug(`Analyzing description: ${description}`);

      if (!this.deepseekApiKey) {
        throw new HttpException(
          'Deepseek API key not configured',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      const response = await axios.post(
        this.deepseekApiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: `As a medical expert, analyze the following patient description and provide a JSON response (no markdown formatting):
              Patient description: "${description}"
              
              Format the response as:
              {
                "analysis": "brief analysis of the symptoms",
                "possibleConditions": [
                  {
                    "condition": "condition name",
                    "icdCode": "ICD10 code",
                    "confidence": number,
                    "reasoning": "brief explanation"
                  }
                ]
              }`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.debug('Deepseek API Response:', response.data);

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new HttpException(
          'Invalid response from Deepseek API',
          HttpStatus.BAD_GATEWAY
        );
      }

      const content = response.data.choices[0].message.content;
      const cleanedContent = this.cleanJsonResponse(content);
      
      try {
        const parsedResponse = JSON.parse(cleanedContent);
        
        // Validate response structure
        if (!parsedResponse.analysis || !Array.isArray(parsedResponse.possibleConditions)) {
          throw new HttpException(
            'Invalid response format from Deepseek API',
            HttpStatus.BAD_GATEWAY
          );
        }

        return parsedResponse;
      } catch (parseError) {
        this.logger.error('Failed to parse cleaned content:', cleanedContent);
        throw new HttpException(
          'Failed to parse Deepseek API response',
          HttpStatus.BAD_GATEWAY
        );
      }

    } catch (error) {
      this.logger.error('Error in analyzeWithDeepseek:', error);
      throw error;
    }
  }

  async analyzeHealthCondition(description: string): Promise<HealthAnalysisResponseDto> {
    try {
      // Get AI analysis
      const aiAnalysis = await this.analyzeWithDeepseek(description);

      // Get ICD codes from analysis
      const icdCodes = aiAnalysis.possibleConditions.map(condition => condition.icdCode);

      this.logger.debug('Looking up ICD codes:', icdCodes);

      // Find matching ICD codes in database
      const matchingCodes = await this.prisma.iCD10.findMany({
        where: {
          code: {
            in: icdCodes,
          },
        },
      });

      this.logger.debug('Found matching ICD codes:', matchingCodes);

      // Combine AI analysis with database information
      return {
        analysis: aiAnalysis.analysis,
        possibleConditions: aiAnalysis.possibleConditions.map(condition => ({
          ...condition,
          icdDetails: matchingCodes.find(code => code.code === condition.icdCode),
        })),
      };
    } catch (error) {
      this.logger.error('Error in analyzeHealthCondition:', error);
      throw error;
    }
  }
}