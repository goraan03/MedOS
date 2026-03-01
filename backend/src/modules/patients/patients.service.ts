import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clinicId: string, search?: string) {
    return this.prisma.patient.findMany({
      where: {
        clinicId,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(clinicId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      include: {
        appointments: {
          orderBy: { startAt: 'desc' },
          take: 10,
          include: {
            service: true,
            doctor: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async create(clinicId: string, dto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        ...dto,
        clinicId,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });
  }

  async update(clinicId: string, patientId: string, dto: UpdatePatientDto) {
    await this.findOne(clinicId, patientId);
    return this.prisma.patient.update({
      where: { id: patientId },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });
  }

  async remove(clinicId: string, patientId: string) {
    await this.findOne(clinicId, patientId);
    return this.prisma.patient.delete({ where: { id: patientId } });
  }
}
