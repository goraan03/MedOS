import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/types/jwt.types';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  GetAppointmentsDto,
} from './dto/appointment.dto';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: GetAppointmentsDto) {
    return this.appointmentsService.findAll(user.clinicId, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.appointmentsService.findOne(user.clinicId, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(user.clinicId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(user.clinicId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.appointmentsService.remove(user.clinicId, id);
  }
}
