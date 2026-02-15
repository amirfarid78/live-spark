import { IsEmail, IsOptional, IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'cooluser' })
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' })
  username: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  display_name?: string;
}

export class RegisterPhoneDto {
  @ApiProperty({ example: '+923001234567' })
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Phone must be in E.164 format' })
  phone: string;

  @ApiProperty({ example: 'cooluser' })
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  display_name?: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+923001234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(4)
  code: string;
}

export class LoginEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  password: string;
}

export class LoginPhoneDto {
  @ApiProperty({ example: '+923001234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
}

export class SocialLoginDto {
  @ApiProperty({ example: 'google' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class SendOtpDto {
  @ApiProperty({ example: '+923001234567' })
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/)
  phone: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  new_password: string;
}

export class FirebaseLoginDto {
  @ApiProperty({ description: 'Firebase ID token from frontend auth' })
  @IsString()
  @IsNotEmpty()
  id_token: string;

  @ApiProperty({ example: 'phone', description: 'Auth provider: phone or google' })
  @IsString()
  @IsNotEmpty()
  provider: 'phone' | 'google';
}
