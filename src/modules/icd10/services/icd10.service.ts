import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateICD10Dto } from '../dtos/icd10.create.dto';
import { SearchICD10Dto } from '../dtos/icd10.search.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class ICD10Service {
  constructor(private prisma: PrismaService) {}

  async search(searchDto: SearchICD10Dto) {
    const { query = '', version } = searchDto;
    
    return this.prisma.iCD10.findMany({
      where: {
        AND: [
          {
            OR: [
              { code: { contains: query, mode: 'insensitive' } },
              { display: { contains: query, mode: 'insensitive' } },
            ],
          },
          version ? { version } : {},
        ],
      },
      take: 10,
      orderBy: {
        code: 'asc',
      },
    });
  }

  async findAll({ page = 1, limit = 10, version }: { page: number; limit: number; version?: string }) {
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.iCD10.count({
        where: version ? { version } : undefined,
      }),
      this.prisma.iCD10.findMany({
        where: version ? { version } : undefined,
        skip,
        take: limit,
        orderBy: {
          code: 'asc',
        },
      }),
    ]);

    return {
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByCode(code: string) {
    return this.prisma.iCD10.findUnique({
      where: { code },
    });
  }

  async createBulk(data: CreateICD10Dto[]) {
    try {
      const result = await this.prisma.iCD10.createMany({
        data,
        skipDuplicates: true,
      });
      return { imported: result.count };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Database error: ${error.message}`);
      }
      throw new BadRequestException('Failed to import ICD10 data');
    }
  }

  async autocomplete(query: string, limit: number = 10) {
    return this.prisma.iCD10.findMany({
      where: {
        OR: [
          { code: { startsWith: query, mode: 'insensitive' } },
          { display: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: [
        { code: 'asc' },
      ],
      select: {
        code: true,
        display: true,
        version: true,
      },
    });
  }

  async searchWithFilters({
    query,
    version,
    page = 1,
    limit = 10,
    orderBy = 'code',
    orderDirection = 'asc',
  }: {
    query?: string;
    version?: string;
    page?: number;
    limit?: number;
    orderBy?: 'code' | 'display' | 'version';
    orderDirection?: 'asc' | 'desc';
  }) {
    const skip = (page - 1) * limit;

    const where: Prisma.ICD10WhereInput = {
      AND: [
        query
          ? {
              OR: [
                { code: { contains: query, mode: 'insensitive' } },
                { display: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {},
        version ? { version } : {},
      ],
    };

    const [total, data] = await Promise.all([
      this.prisma.iCD10.count({ where }),
      this.prisma.iCD10.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [orderBy]: orderDirection,
        },
      }),
    ]);

    return {
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}