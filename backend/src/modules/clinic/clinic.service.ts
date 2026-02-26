import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateClinicDto, ToggleModuleDto, InviteStaffDto } from './dto/clinic.dto';
import { ClinicRole } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ClinicService {
  constructor(private readonly prisma: PrismaService) {}

  async getClinic(clinicId: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      include: { modules: true },
    });
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async updateClinic(clinicId: string, dto: UpdateClinicDto) {
    return this.prisma.clinic.update({
      where: { id: clinicId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.settings && { settings: JSON.stringify(dto.settings) }),
      },
    });
  }

  async toggleModule(clinicId: string, dto: ToggleModuleDto) {
    return this.prisma.clinicModule.upsert({
      where: { clinicId_moduleKey: { clinicId, moduleKey: dto.moduleKey } },
      create: { clinicId, moduleKey: dto.moduleKey, enabled: dto.enabled },
      update: { enabled: dto.enabled },
    });
  }

  async getStaff(clinicId: string) {
    return this.prisma.clinicUser.findMany({
      where: { clinicId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async inviteStaff(clinicId: string, dto: InviteStaffDto) {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const defaultPermissions = this.getPermissionsByRole(dto.role);

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash: crypto.randomBytes(32).toString('hex'),
        },
      });
    }

    const existing = await this.prisma.clinicUser.findUnique({
      where: { clinicId_userId: { clinicId, userId: user.id } },
    });
    if (existing) throw new ConflictException('User already in this clinic');

    const clinicUser = await this.prisma.clinicUser.create({
      data: {
        clinicId,
        userId: user.id,
        role: dto.role,
        permissions: defaultPermissions,
        specialties: dto.specialties ?? [],
        inviteToken,
        invitedAt: new Date(),
        isActive: false,
      },
    });

    return { clinicUser, inviteToken };
  }

  async acceptInvite(token: string, newPassword: string) {
    const clinicUser = await this.prisma.clinicUser.findUnique({
      where: { inviteToken: token },
      include: { user: true },
    });
    if (!clinicUser) throw new NotFoundException('Invalid invite token');

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: clinicUser.userId },
        data: { passwordHash },
      }),
      this.prisma.clinicUser.update({
        where: { id: clinicUser.id },
        data: { isActive: true, inviteToken: null, joinedAt: new Date() },
      }),
    ]);

    return { message: 'Invite accepted successfully' };
  }

  async updateStaffRole(clinicId: string, clinicUserId: string, role: ClinicRole) {
    return this.prisma.clinicUser.update({
      where: { id: clinicUserId, clinicId },
      data: { role, permissions: this.getPermissionsByRole(role) },
    });
  }

  async deactivateStaff(clinicId: string, clinicUserId: string) {
    return this.prisma.clinicUser.update({
      where: { id: clinicUserId, clinicId },
      data: { isActive: false },
    });
  }

  private getPermissionsByRole(role: ClinicRole): string[] {
    const map: Record<ClinicRole, string[]> = {
      OWNER: ['patients.read', 'patients.write', 'appointments.read', 'appointments.write', 'encounters.read', 'encounters.write', 'billing.read', 'billing.write', 'staff.read', 'staff.write', 'clinic.settings', 'reports.read'],
      ADMIN: ['patients.read', 'patients.write', 'appointments.read', 'appointments.write', 'encounters.read', 'encounters.write', 'billing.read', 'billing.write', 'staff.read', 'staff.write', 'reports.read'],
      RECEPTIONIST: ['patients.read', 'patients.write', 'appointments.read', 'appointments.write', 'billing.read'],
      DOCTOR: ['patients.read', 'appointments.read', 'appointments.write', 'encounters.read', 'encounters.write'],
      ASSISTANT: ['patients.read', 'appointments.read', 'encounters.read'],
    };
    return map[role];
  }
}