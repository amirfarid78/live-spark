import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

export enum RoleType {
  USER = 'user',
  CREATOR = 'creator',
  STREAMER = 'streamer',
  VIP = 'vip',
  AGENCY = 'agency',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

@Entity('user_roles')
@Index(['user_id', 'role'], { unique: true })
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  role: RoleType;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
