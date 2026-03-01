import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  GetAppointmentsDto,
} from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clinicId: string, query: GetAppointmentsDto) {
    const { from, to, doctorId } = query;
    return this.prisma.appointment.findMany({
      where: {
        clinicId,
        ...(doctorId && { doctorId }),
        ...(from &&
          to && {
            startAt: { gte: new Date(from), lte: new Date(to) },
          }),
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        doctor: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        service: {
          select: { id: true, name: true, durationMin: true, price: true },
        },
        resource: true,
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async findOne(clinicId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, clinicId },
      include: {
        patient: true,
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        service: true,
        resource: true,
      },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async create(clinicId: string, dto: CreateAppointmentDto) {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    await this.checkDoctorOverlap(clinicId, dto.doctorId, startAt, endAt);

    if (dto.resourceId) {
      await this.checkResourceOverlap(clinicId, dto.resourceId, startAt, endAt);
    }

    return this.prisma.appointment.create({
      data: {
        clinicId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        serviceId: dto.serviceId,
        resourceId: dto.resourceId,
        startAt,
        endAt,
        notes: dto.notes,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        service: { select: { id: true, name: true } },
        doctor: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
  }

  async update(
    clinicId: string,
    appointmentId: string,
    dto: UpdateAppointmentDto,
  ) {
    const existing = await this.findOne(clinicId, appointmentId);

    const startAt = dto.startAt ? new Date(dto.startAt) : existing.startAt;
    const endAt = dto.endAt ? new Date(dto.endAt) : existing.endAt;
    const doctorId = dto.doctorId ?? existing.doctorId;

    if (dto.startAt || dto.endAt || dto.doctorId) {
      await this.checkDoctorOverlap(
        clinicId,
        doctorId,
        startAt,
        endAt,
        appointmentId,
      );
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...(dto.startAt && { startAt }),
        ...(dto.endAt && { endAt }),
        ...(dto.status && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.doctorId && { doctorId: dto.doctorId }),
        ...(dto.resourceId && { resourceId: dto.resourceId }),
      },
    });
  }

  async remove(clinicId: string, appointmentId: string) {
    await this.findOne(clinicId, appointmentId);
    return this.prisma.appointment.delete({ where: { id: appointmentId } });
  }

  // ─── Anti-overlap ─────────────────────────────────────────

  private async checkDoctorOverlap(
    clinicId: string,
    doctorId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ) {
    const overlap = await this.prisma.appointment.findFirst({
      where: {
        clinicId,
        doctorId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { notIn: ['CANCELED', 'NO_SHOW'] },
        OR: [{ startAt: { lt: endAt }, endAt: { gt: startAt } }],
      },
    });
    if (overlap)
      throw new ConflictException('Doctor has overlapping appointment');
  }

  private async checkResourceOverlap(
    clinicId: string,
    resourceId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ) {
    const overlap = await this.prisma.appointment.findFirst({
      where: {
        clinicId,
        resourceId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { notIn: ['CANCELED', 'NO_SHOW'] },
        OR: [{ startAt: { lt: endAt }, endAt: { gt: startAt } }],
      },
    });
    if (overlap)
      throw new ConflictException('Resource has overlapping appointment');
  }
}
