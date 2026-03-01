import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaymentDto, GetPaymentsDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clinicId: string, query: GetPaymentsDto) {
    return this.prisma.payment.findMany({
      where: {
        clinicId,
        ...(query.patientId && { patientId: query.patientId }),
        ...(query.appointmentId && { appointmentId: query.appointmentId }),
        ...(query.from &&
          query.to && {
            paidAt: { gte: new Date(query.from), lte: new Date(query.to) },
          }),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        appointment: { select: { id: true, startAt: true } },
      },
      orderBy: { paidAt: 'desc' },
    });
  }

  async findOne(clinicId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, clinicId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        appointment: { select: { id: true, startAt: true } },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async create(clinicId: string, dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        clinicId,
        appointmentId: dto.appointmentId,
        patientId: dto.patientId,
        amount: dto.amount,
        method: dto.method,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        note: dto.note,
      },
    });
  }

  async remove(clinicId: string, paymentId: string) {
    await this.findOne(clinicId, paymentId);
    return this.prisma.payment.delete({ where: { id: paymentId } });
  }

  async getSummary(clinicId: string, from: string, to: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        clinicId,
        paidAt: { gte: new Date(from), lte: new Date(to) },
      },
    });

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const byMethod = payments.reduce(
      (acc, p) => {
        acc[p.method] = (acc[p.method] ?? 0) + Number(p.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, byMethod, count: payments.length };
  }
}
