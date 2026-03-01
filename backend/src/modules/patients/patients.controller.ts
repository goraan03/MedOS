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
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('search') search?: string) {
    return this.patientsService.findAll(user.clinicId, search);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.patientsService.findOne(user.clinicId, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePatientDto) {
    return this.patientsService.create(user.clinicId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientsService.update(user.clinicId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.patientsService.remove(user.clinicId, id);
  }
}
