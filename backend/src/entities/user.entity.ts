import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable, Index,
} from 'typeorm';
import { Profile } from './profile.entity';
import { UserRole } from './user-role.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  @Index()
  email: string;

  @Column({ unique: true, nullable: true })
  @Index()
  phone: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ nullable: true })
  social_provider: string; // google, facebook, apple

  @Column({ nullable: true })
  social_id: string;

  @Column({ unique: true, nullable: true })
  @Index()
  firebase_uid: string;

  @Column({ nullable: true })
  fcm_token: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_banned: boolean;

  @Column({ nullable: true })
  banned_reason: string;

  @Column({ nullable: true })
  banned_until: Date;

  @Column({ default: false })
  is_shadow_banned: boolean;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ default: false })
  phone_verified: boolean;

  @Column({ nullable: true })
  last_login_at: Date;

  @Column({ nullable: true })
  last_login_ip: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @OneToMany(() => UserRole, (role) => role.user, { cascade: true })
  roles: UserRole[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refresh_tokens: RefreshToken[];
}
