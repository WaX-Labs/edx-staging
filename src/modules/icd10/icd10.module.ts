import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../common/services/prisma.service';
import { ICD10Controller } from './controllers/icd10.controller';
import { ICD10Service } from './services/icd10.service';
import { PassportModule } from '@nestjs/passport';
import { AuthJwtAccessStrategy } from 'src/strategies/jwt.access.strategy';
import { AuthJwtRefreshStrategy } from 'src/strategies/jwt.refresh.strategy';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'ICD10_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get('rmq.uri')}`],
            queue: `${configService.get('rmq.icd10')}`,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    PassportModule.register({
      session: false,
    }),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [ICD10Controller],
  providers: [
    ICD10Service,
    PrismaService,
  ],
  exports: [ICD10Service],
})
export class ICD10Module {}
