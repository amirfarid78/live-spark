import {
  Injectable, ConflictException, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity';
import { Profile, UserLevel } from '../../entities/profile.entity';
import { UserRole, RoleType } from '../../entities/user-role.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { FirebaseService } from '../../common/firebase/firebase.service';
import {
  RegisterEmailDto, RegisterPhoneDto, LoginEmailDto,
  SocialLoginDto, RefreshTokenDto, FirebaseLoginDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(UserRole) private rolesRepo: Repository<UserRole>,
    @InjectRepository(RefreshToken) private refreshRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private firebaseService: FirebaseService,
  ) {}

  async registerWithEmail(dto: RegisterEmailDto) {
    // Check existing
    const existingEmail = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException('Email already registered');

    const existingUsername = await this.profilesRepo.findOne({ where: { username: dto.username } });
    if (existingUsername) throw new ConflictException('Username already taken');

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = this.usersRepo.create({
      email: dto.email,
      password: hashedPassword,
      email_verified: false,
    });
    await this.usersRepo.save(user);

    // Create profile
    const profile = this.profilesRepo.create({
      user_id: user.id,
      username: dto.username,
      display_name: dto.display_name || dto.username,
      level: UserLevel.BRONZE,
    });
    await this.profilesRepo.save(profile);

    // Assign default role
    const role = this.rolesRepo.create({ user_id: user.id, role: RoleType.USER });
    await this.rolesRepo.save(role);

    return this.generateTokens(user, [RoleType.USER]);
  }

  async registerWithPhone(dto: RegisterPhoneDto) {
    const existingPhone = await this.usersRepo.findOne({ where: { phone: dto.phone } });
    if (existingPhone) throw new ConflictException('Phone already registered');

    const existingUsername = await this.profilesRepo.findOne({ where: { username: dto.username } });
    if (existingUsername) throw new ConflictException('Username already taken');

    const user = this.usersRepo.create({
      phone: dto.phone,
      phone_verified: true, // OTP was verified before
    });
    await this.usersRepo.save(user);

    const profile = this.profilesRepo.create({
      user_id: user.id,
      username: dto.username,
      display_name: dto.display_name || dto.username,
      level: UserLevel.BRONZE,
    });
    await this.profilesRepo.save(profile);

    const role = this.rolesRepo.create({ user_id: user.id, role: RoleType.USER });
    await this.rolesRepo.save(role);

    return this.generateTokens(user, [RoleType.USER]);
  }

  async loginWithEmail(dto: LoginEmailDto) {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.is_banned) throw new UnauthorizedException('Account is banned');
    if (!user.password) throw new UnauthorizedException('Please use social login');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // Update last login
    user.last_login_at = new Date();
    await this.usersRepo.save(user);

    const roles = await this.rolesRepo.find({ where: { user_id: user.id } });
    return this.generateTokens(user, roles.map(r => r.role));
  }

  async loginWithSocial(dto: SocialLoginDto) {
    let user = await this.usersRepo.findOne({
      where: { social_provider: dto.provider, social_id: dto.access_token },
    });

    if (!user) {
      // Auto-register
      user = this.usersRepo.create({
        social_provider: dto.provider,
        social_id: dto.access_token,
        email_verified: true,
      });
      await this.usersRepo.save(user);

      const username = dto.username || `user_${user.id.slice(0, 8)}`;
      const profile = this.profilesRepo.create({
        user_id: user.id,
        username,
        display_name: username,
        level: UserLevel.BRONZE,
      });
      await this.profilesRepo.save(profile);

      const role = this.rolesRepo.create({ user_id: user.id, role: RoleType.USER });
      await this.rolesRepo.save(role);
    }

    if (user.is_banned) throw new UnauthorizedException('Account is banned');

    user.last_login_at = new Date();
    await this.usersRepo.save(user);

    const roles = await this.rolesRepo.find({ where: { user_id: user.id } });
    return this.generateTokens(user, roles.map(r => r.role));
  }

  async loginWithFirebase(dto: FirebaseLoginDto) {
    // Verify Firebase token
    const decodedToken = await this.firebaseService.verifyIdToken(dto.id_token);
    
    if (!decodedToken) {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const phone = decodedToken.phone_number;
    const displayName = decodedToken.name;
    const avatarUrl = decodedToken.picture;

    // Try to find existing user by Firebase UID, email, or phone
    let user = await this.usersRepo.findOne({
      where: [
        { firebase_uid: firebaseUid },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    });

    if (!user) {
      // Auto-register new user
      user = this.usersRepo.create({
        firebase_uid: firebaseUid,
        email: email || undefined,
        phone: phone || undefined,
        email_verified: !!decodedToken.email_verified,
        phone_verified: !!phone,
        social_provider: dto.provider === 'google' ? 'google' : undefined,
      });
      await this.usersRepo.save(user);

      // Generate unique username
      const baseUsername = displayName?.toLowerCase().replace(/[^a-z0-9_]/g, '') 
        || (email ? email.split('@')[0] : `user_${user.id.slice(0, 8)}`);
      let username = baseUsername;
      let counter = 1;
      while (await this.profilesRepo.findOne({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      const profile = this.profilesRepo.create({
        user_id: user.id,
        username,
        display_name: displayName || username,
        avatar_url: avatarUrl || undefined,
        level: UserLevel.BRONZE,
      });
      await this.profilesRepo.save(profile);

      const role = this.rolesRepo.create({ user_id: user.id, role: RoleType.USER });
      await this.rolesRepo.save(role);
    } else {
      // Update Firebase UID if not set
      if (!user.firebase_uid) {
        user.firebase_uid = firebaseUid;
      }
      // Update email/phone if provided and not set
      if (email && !user.email) {
        user.email = email;
        user.email_verified = !!decodedToken.email_verified;
      }
      if (phone && !user.phone) {
        user.phone = phone;
        user.phone_verified = true;
      }
    }

    if (user.is_banned) throw new UnauthorizedException('Account is banned');

    user.last_login_at = new Date();
    await this.usersRepo.save(user);

    const roles = await this.rolesRepo.find({ where: { user_id: user.id } });
    return this.generateTokens(user, roles.map(r => r.role));
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const stored = await this.refreshRepo.findOne({
      where: { token: dto.refresh_token, is_revoked: false },
    });

    if (!stored || stored.expires_at < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old token
    stored.is_revoked = true;
    await this.refreshRepo.save(stored);

    const user = await this.usersRepo.findOne({ where: { id: stored.user_id } });
    if (!user || user.is_banned) throw new UnauthorizedException('Account unavailable');

    const roles = await this.rolesRepo.find({ where: { user_id: user.id } });
    return this.generateTokens(user, roles.map(r => r.role));
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.refreshRepo.update(
        { user_id: userId, token: refreshToken },
        { is_revoked: true },
      );
    } else {
      // Revoke all tokens
      await this.refreshRepo.update(
        { user_id: userId, is_revoked: false },
        { is_revoked: true },
      );
    }
    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) throw new UnauthorizedException('User not found');
    if (!user.password) throw new BadRequestException('Cannot change password for social login accounts');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    // Validate new password
    if (newPassword.length < 8) throw new BadRequestException('Password must be at least 8 characters');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await this.usersRepo.save(user);

    return { message: 'Password changed successfully' };
  }

  async getMe(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['profile', 'roles'],
    });

    if (!user) throw new UnauthorizedException('User not found');

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      profile: user.profile,
      roles: user.roles?.map(r => r.role) || [],
      is_active: user.is_active,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
      created_at: user.created_at,
    };
  }

  private async generateTokens(user: User, roles: RoleType[]) {
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      roles,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = uuidv4();
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    await this.refreshRepo.save({
      user_id: user.id,
      token: refreshToken,
      expires_at: refreshExpiry,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.configService.get('JWT_EXPIRATION', '15m'),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        roles,
      },
    };
  }
}
