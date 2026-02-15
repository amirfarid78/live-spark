import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report, UserStrike, AuditLog } from '../../entities/report.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Report, UserStrike, AuditLog, User])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
