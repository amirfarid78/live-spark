import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { RoleType } from '../../../entities/user-role.entity';

export class ListUsersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: RoleType })
  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_banned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}

export class BanUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Ban duration in days, null for permanent' })
  @IsOptional()
  duration_days?: number;
}

export class AssignRoleDto {
  @IsEnum(RoleType)
  role: RoleType;
}

export class RegisterFCMTokenDto {
  @IsString()
  fcm_token: string;

  @IsOptional()
  @IsString()
  device_type?: string; // 'web' | 'android' | 'ios'
}
