import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { EudoxTokenService } from '../services/eudox-token.service';
import { TokenBalanceDto, TokenTransferDto, TokenPriceDto } from '../dtos/token.dto';

@ApiTags('EUDOX Token')
@Controller('token')
export class TokenController {
  constructor(private readonly eudoxTokenService: EudoxTokenService) {}

  @Get('balance/:walletAddress')
  @ApiOperation({ summary: 'Get EUDOX token balance' })
  @ApiResponse({ status: 200, type: Number })
  async getBalance(@Param() params: TokenBalanceDto): Promise<number> {
    return this.eudoxTokenService.getTokenBalance(params.walletAddress);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer EUDOX tokens' })
  @ApiResponse({ status: 200, type: String })
  @ApiSecurity('private-key')
  async transfer(@Body() transferDto: TokenTransferDto): Promise<string> {
    return this.eudoxTokenService.transferTokens(
      transferDto.fromPrivateKey,
      transferDto.toAddress,
      transferDto.amount
    );
  }

  @Get('price')
  @ApiOperation({ summary: 'Get current EUDOX token price' })
  @ApiResponse({ status: 200, type: TokenPriceDto })
  async getPrice(): Promise<TokenPriceDto> {
    const price = await this.eudoxTokenService.getTokenPrice();
    return {
      price,
      currency: 'USD',
      timestamp: new Date(),
    };
  }
}