import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  UpdateClinicDto,
  UpdateModulesDto,
  InviteStaffDto,
} from './dto/clinic.dto';
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
        ...(dto.pib !== undefined && { pib: dto.pib }),
        ...(dto.isPolyclinic !== undefined && {
          isPolyclinic: dto.isPolyclinic,
        }),
        ...(dto.settings && { settings: dto.settings as any }),
      },
    });
  }

  async getModules(clinicId: string) {
    return this.prisma.clinicModule.findMany({
      where: { clinicId },
      orderBy: { enabledAt: 'asc' },
    });
  }

  async updateModules(clinicId: string, dto: UpdateModulesDto) {
    const requestedModules = [
      'general',
      ...dto.modules.filter((m) => m !== 'general'),
    ];
    const existing = await this.prisma.clinicModule.findMany({
      where: { clinicId },
    });
    const existingKeys = existing.map((m) => m.moduleKey);

    // Moduli koji postoje ali su trenutno deaktivirani a treba ih ponovo omogućiti
    const toEnable = existing
      .filter((m) => !m.enabled && requestedModules.includes(m.moduleKey))
      .map((m) => m.moduleKey);

    // Moduli koje treba dodati
    const toAdd = requestedModules.filter((m) => !existingKeys.includes(m));

    // Moduli koje treba deaktivirati
    const toDisable = existingKeys.filter(
      (m) => !requestedModules.includes(m) && m !== 'general',
    );

    // Proveri da li postoje encounters za module koje hoćemo da deaktivišemo
    const modulesWithData: string[] = [];
    for (const moduleKey of toDisable) {
      const count = await this.prisma.encounter.count({
        where: { clinicId, moduleKey },
      });
      if (count > 0) modulesWithData.push(moduleKey);
    }

    await this.prisma.$transaction(async (tx) => {
      // Dodaj nove module
      for (const moduleKey of toAdd) {
        await tx.clinicModule.create({
          data: { clinicId, moduleKey, enabled: true },
        });
      }

      // Ponovo aktiviraj module koji već postoje ali su bili ugašeni
      if (toEnable.length > 0) {
        await tx.clinicModule.updateMany({
          where: { clinicId, moduleKey: { in: toEnable } },
          data: { enabled: true, enabledAt: new Date() },
        });
      }

      // Deaktiviraj stare (podaci ostaju)
      if (toDisable.length > 0) {
        await tx.clinicModule.updateMany({
          where: { clinicId, moduleKey: { in: toDisable } },
          data: { enabled: false },
        });
      }
    });

    return {
      modules: await this.prisma.clinicModule.findMany({ where: { clinicId } }),
      warnings:
        modulesWithData.length > 0
          ? `Modules ${modulesWithData.join(', ')} have existing data and were deactivated but data is preserved.`
          : null,
    };
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
        allowedModules: dto.allowedModules ?? [],
        inviteToken,
        invitedAt: new Date(),
        isActive: false,
      },
    });

    return { clinicUser, inviteToken };
  }

  async updateStaffRole(
    clinicId: string,
    clinicUserId: string,
    role: ClinicRole,
  ) {
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
      OWNER: [
        'patients.read',
        'patients.write',
        'appointments.read',
        'appointments.write',
        'encounters.read',
        'encounters.write',
        'billing.read',
        'billing.write',
        'staff.read',
        'staff.write',
        'clinic.settings',
        'reports.read',
      ],
      ADMIN: [
        'patients.read',
        'patients.write',
        'appointments.read',
        'appointments.write',
        'encounters.read',
        'encounters.write',
        'billing.read',
        'billing.write',
        'staff.read',
        'staff.write',
        'reports.read',
      ],
      RECEPTIONIST: [
        'patients.read',
        'patients.write',
        'appointments.read',
        'appointments.write',
        'billing.read',
      ],
      DOCTOR: [
        'patients.read',
        'appointments.read',
        'appointments.write',
        'encounters.read',
        'encounters.write',
      ],
      ASSISTANT: ['patients.read', 'appointments.read', 'encounters.read'],
    };
    return map[role];
  }
}
