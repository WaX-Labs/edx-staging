import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class TokenBalanceDto {
  @ApiProperty()
  @IsString()
  walletAddress: string;
}

export class TokenTransferDto {
    @ApiProperty({
      description: 'Private key of the sender wallet (JSON string format)',
      example: '[1,2,3,...]' // Don't show real private keys in examples
    })
    @IsString()
    @IsNotEmpty()
    fromPrivateKey: string;
  
    @ApiProperty({
      description: 'Public address of the recipient wallet',
      example: 'GsbwXfJraMomNxBcpR5UVnKwQHvK8RcANHVppt6h2Hk3'
    })
    @IsString()
    @IsNotEmpty()
    toAddress: string;
  
    @ApiProperty({
      description: 'Amount of tokens to transfer',
      example: 100
    })
    @IsNumber()
    @IsNotEmpty()
    amount: number;
  }

export class TokenPriceDto {
  @ApiProperty()
  price: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  timestamp: Date;
}