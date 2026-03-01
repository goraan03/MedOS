import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clinicId: string, moduleKey?: string) {
    return this.prisma.service.findMany({
      where: {
        clinicId,
        isActive: true,
        ...(moduleKey && { moduleKey }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(clinicId: string, serviceId: string) {
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, clinicId },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async create(clinicId: string, dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: { ...dto, clinicId },
    });
  }

  async update(clinicId: string, serviceId: string, dto: UpdateServiceDto) {
    await this.findOne(clinicId, serviceId);
    return this.prisma.service.update({
      where: { id: serviceId },
      data: dto,
    });
  }

  async remove(clinicId: string, serviceId: string) {
    await this.findOne(clinicId, serviceId);
    return this.prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false },
    });
  }
}
