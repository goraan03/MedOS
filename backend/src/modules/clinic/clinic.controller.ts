import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClinicRole } from '@prisma/client';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/rbac.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/types/jwt.types';

import { ClinicService } from './clinic.service';
import { UpdateClinicDto, ToggleModuleDto, InviteStaffDto } from './dto/clinic.dto';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('clinic')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Get()
  getClinic(@CurrentUser() user: JwtPayload) {
    return this.clinicService.getClinic(user.clinicId);
  }

  @Patch()
  @Roles(ClinicRole.OWNER, ClinicRole.ADMIN)
  updateClinic(@CurrentUser() user: JwtPayload, @Body() dto: UpdateClinicDto) {
    return this.clinicService.updateClinic(user.clinicId, dto);
  }

  @Patch('modules')
  @Roles(ClinicRole.OWNER, ClinicRole.ADMIN)
  toggleModule(@CurrentUser() user: JwtPayload, @Body() dto: ToggleModuleDto) {
    return this.clinicService.toggleModule(user.clinicId, dto);
  }

  @Get('staff')
  getStaff(@CurrentUser() user: JwtPayload) {
    return this.clinicService.getStaff(user.clinicId);
  }

  @Post('staff/invite')
  @Roles(ClinicRole.OWNER, ClinicRole.ADMIN)
  inviteStaff(@CurrentUser() user: JwtPayload, @Body() dto: InviteStaffDto) {
    return this.clinicService.inviteStaff(user.clinicId, dto);
  }

  @Patch('staff/:id/role')
  @Roles(ClinicRole.OWNER, ClinicRole.ADMIN)
  updateRole(
    @CurrentUser() user: JwtPayload,
    @Param('id') staffId: string,
    @Body('role') role: ClinicRole,
  ) {
    return this.clinicService.updateStaffRole(user.clinicId, staffId, role);
  }

  @Delete('staff/:id')
  @Roles(ClinicRole.OWNER, ClinicRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivateStaff(@CurrentUser() user: JwtPayload, @Param('id') staffId: string) {
    return this.clinicService.deactivateStaff(user.clinicId, staffId);
  }
}