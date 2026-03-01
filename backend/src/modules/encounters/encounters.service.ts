import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateEncounterDto,
  UpdateEncounterDto,
  GetEncountersDto,
} from './dto/encounter.dto';

@Injectable()
export class EncountersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clinicId: string, query: GetEncountersDto) {
    return this.prisma.encounter.findMany({
      where: {
        clinicId,
        ...(query.patientId && { patientId: query.patientId }),
        ...(query.moduleKey && { moduleKey: query.moduleKey }),
      },
      include: {
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        patient: { select: { id: true, firstName: true, lastName: true } },
        appointment: { select: { id: true, startAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(clinicId: string, encounterId: string) {
    const encounter = await this.prisma.encounter.findFirst({
      where: { id: encounterId, clinicId },
      include: {
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        patient: { select: { id: true, firstName: true, lastName: true } },
        appointment: { select: { id: true, startAt: true } },
      },
    });
    if (!encounter) throw new NotFoundException('Encounter not found');
    return encounter;
  }

  async create(clinicId: string, dto: CreateEncounterDto) {
    return this.prisma.encounter.create({
      data: {
        clinicId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        appointmentId: dto.appointmentId,
        moduleKey: dto.moduleKey,
        summary: dto.summary,
        note: dto.note,
        visibility: dto.visibility ?? 'STAFF_ONLY',
        extraData: (dto.extraData ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async update(clinicId: string, encounterId: string, dto: UpdateEncounterDto) {
    await this.findOne(clinicId, encounterId);
    return this.prisma.encounter.update({
      where: { id: encounterId },
      data: {
        ...(dto.summary !== undefined && { summary: dto.summary }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.visibility && { visibility: dto.visibility }),
        ...(dto.extraData !== undefined && {
          extraData: dto.extraData as Prisma.InputJsonValue,
        }),
      },
    });
  }

  async remove(clinicId: string, encounterId: string) {
    await this.findOne(clinicId, encounterId);
    return this.prisma.encounter.delete({ where: { id: encounterId } });
  }
}
