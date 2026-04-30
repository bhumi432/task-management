import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  summary(@Req() req: any) {
    return this.dashboard.summary(req.user.id);
  }
}

