import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, GetPaymentsDto } from './dto/payment.dto';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: GetPaymentsDto) {
    return this.paymentsService.findAll(user.clinicId, query);
  }

  @Get('summary')
  getSummary(
    @CurrentUser() user: JwtPayload,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.paymentsService.getSummary(user.clinicId, from, to);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.findOne(user.clinicId, id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(user.clinicId, dto);
  }

  @Delete(':id')
  @Roles(ClinicRole.OWNER, ClinicRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.remove(user.clinicId, id);
  }
}
