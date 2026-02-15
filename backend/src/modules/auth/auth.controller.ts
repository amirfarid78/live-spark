import {
  Controller, Post, Get, Body, UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterEmailDto, RegisterPhoneDto, LoginEmailDto,
  SocialLoginDto, RefreshTokenDto, FirebaseLoginDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/email')
  @ApiOperation({ summary: 'Register with email and password' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async registerEmail(@Body() dto: RegisterEmailDto) {
    return this.authService.registerWithEmail(dto);
  }

  @Post('register/phone')
  @ApiOperation({ summary: 'Register with phone number (after OTP verification)' })
  async registerPhone(@Body() dto: RegisterPhoneDto) {
    return this.authService.registerWithPhone(dto);
  }

  @Post('login/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async loginEmail(@Body() dto: LoginEmailDto) {
    return this.authService.loginWithEmail(dto);
  }

  @Post('login/social')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with social provider' })
  async loginSocial(@Body() dto: SocialLoginDto) {
    return this.authService.loginWithSocial(dto);
  }

  @Post('login/firebase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Firebase (phone or Google)' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid Firebase token' })
  async loginFirebase(@Body() dto: FirebaseLoginDto) {
    return this.authService.loginWithFirebase(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout(
    @CurrentUser('sub') userId: string,
    @Body('refresh_token') refreshToken?: string,
  ) {
    return this.authService.logout(userId, refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  async getMe(@CurrentUser('sub') userId: string) {
    return this.authService.getMe(userId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body('current_password') currentPassword: string,
    @Body('new_password') newPassword: string,
  ) {
    return this.authService.changePassword(userId, currentPassword, newPassword);
  }
}
