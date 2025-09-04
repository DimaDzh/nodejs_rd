import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('metrics')
  @Roles('ADMIN')
  getMetrics() {
    return {
      totalUsers: 42,
      activeConnections: 15,
      requestsPerMinute: 125,
      uptime: '24h 15m 30s',
      timestamp: new Date().toISOString(),
    };
  }
}
