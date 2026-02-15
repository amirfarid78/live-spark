import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AgenciesService } from './agencies.service';
import { AgenciesController } from './agencies.controller';
import { Agency, AgencyStreamer, AgencyEarning } from '../../entities/agency.entity';
import { Profile } from '../../entities/profile.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Agency, AgencyStreamer, AgencyEarning, Profile])],
  controllers: [AgenciesController],
  providers: [AgenciesService],
  exports: [AgenciesService],
})
export class AgenciesModule {}
