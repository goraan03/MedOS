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
import { EncountersService } from './encounters.service';
import {
  CreateEncounterDto,
  UpdateEncounterDto,
  GetEncountersDto,
} from './dto/encounter.dto';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('encounters')
export class EncountersController {
  constructor(private readonly encountersService: EncountersService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: GetEncountersDto) {
    return this.encountersService.findAll(user.clinicId, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.encountersService.findOne(user.clinicId, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateEncounterDto) {
    return this.encountersService.create(user.clinicId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateEncounterDto,
  ) {
    return this.encountersService.update(user.clinicId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.encountersService.remove(user.clinicId, id);
  }
}
