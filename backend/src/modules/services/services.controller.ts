import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ClinicRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/rbac.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/types/jwt.types';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('moduleKey') moduleKey?: string,
  ) {
    return this.servicesService.findAll(user.clinicId, moduleKey);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.servicesService.findOne(user.clinicId, id);
  }

  @Post()
  @Roles(ClinicRole.OWNER, ClinicRole.ADMIN)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(user.clinicId, dto);
  }

  @Patch(':id')
  @Roles(ClinicRole.OWNER, ClinicRole.ADMIN)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(user.clinicId, id, dto);
  }

  @Delete(':id')
  @Roles(ClinicRole.OWNER, ClinicRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.servicesService.remove(user.clinicId, id);
  }
}
