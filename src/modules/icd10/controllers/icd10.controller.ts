import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Param,
    BadRequestException,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ICD10Service } from '../services/icd10.service';
  import { SearchICD10Dto } from '../dtos/icd10.search.dto';
  import { CreateICD10Dto } from '../dtos/icd10.create.dto';
  import { AuthJwtAccessGuard } from 'src/guards/jwt.access.guard';
  import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
  
  @ApiTags('ICD10')
  @Controller('icd10')
//   @UseGuards(AuthJwtAccessGuard)
  export class ICD10Controller {
    constructor(private readonly icd10Service: ICD10Service) {}
  
    @Post('search')
    @ApiOperation({ summary: 'Search ICD10 codes' })
    @ApiResponse({ status: 200, description: 'Returns matching ICD10 codes' })
    async search(@Body() searchDto: SearchICD10Dto) {
      return this.icd10Service.search(searchDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all ICD10 codes' })
    async findAll(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('version') version?: string,
    ) {
      return this.icd10Service.findAll({
        page,
        limit,
        version,
      });
    }
  
    @Get(':code')
    @ApiOperation({ summary: 'Get ICD10 code by code' })
    async findByCode(@Param('code') code: string) {
      const result = await this.icd10Service.findByCode(code);
      if (!result) {
        throw new BadRequestException('ICD10 code not found');
      }
      return result;
    }
  
    @Post('bulk')
    @ApiOperation({ summary: 'Bulk create ICD10 codes' })
    async createBulk(@Body() data: CreateICD10Dto[]) {
      return this.icd10Service.createBulk(data);
    }
  
    @Get('autocomplete/:query')
    @ApiOperation({ summary: 'Autocomplete ICD10 codes' })
    async autocomplete(
      @Param('query') query: string,
      @Query('limit') limit: number = 10,
    ) {
      return this.icd10Service.autocomplete(query, limit);
    }
  }