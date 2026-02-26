import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '../../common/types/jwt.types';
import { ClinicRole } from '@prisma/client';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new ConflictException('Email already in use');

    const slug = this.generateSlug(dto.clinicName);
    const existingClinic = await this.prisma.clinic.findUnique({
      where: { slug },
    });
    if (existingClinic) throw new ConflictException('Clinic name already taken');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      const clinic = await tx.clinic.create({
        data: {
          name: dto.clinicName,
          slug,
          modules: {
            create: [{ moduleKey: 'general', enabled: true }],
          },
        },
      });

      const clinicUser = await tx.clinicUser.create({
        data: {
          clinicId: clinic.id,
          userId: user.id,
          role: ClinicRole.OWNER,
          permissions: this.getDefaultPermissions(ClinicRole.OWNER),
          specialties: [],
          joinedAt: new Date(),
        },
      });

      return { user, clinic, clinicUser };
    });

    return this.buildTokenResponse(result.user, result.clinic, result.clinicUser);
  }

  async login(dto: LoginDto) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { slug: dto.clinicSlug },
    });
    if (!clinic) throw new NotFoundException('Clinic not found');

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const clinicUser = await this.prisma.clinicUser.findUnique({
      where: { clinicId_userId: { clinicId: clinic.id, userId: user.id } },
    });
    if (!clinicUser || !clinicUser.isActive) {
      throw new UnauthorizedException('No access to this clinic');
    }

    return this.buildTokenResponse(user, clinic, clinicUser);
  }

  private buildTokenResponse(
    user: { id: string; email: string; firstName: string; lastName: string },
    clinic: { id: string; slug: string; name: string },
    clinicUser: { role: ClinicRole; permissions: unknown; specialties: unknown },
  ) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      clinicId: clinic.id,
      role: clinicUser.role,
      permissions: clinicUser.permissions as string[],
      specialties: clinicUser.specialties as string[],
    };

    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      clinic: {
        id: clinic.id,
        slug: clinic.slug,
        name: clinic.name,
      },
      role: clinicUser.role,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 50);
  }

  private getDefaultPermissions(role: ClinicRole): string[] {
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