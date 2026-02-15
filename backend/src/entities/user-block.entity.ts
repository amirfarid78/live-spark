import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('user_blocks')
@Index(['blocker_id', 'blocked_id'], { unique: true })
export class UserBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blocker_id: string;

  @Column()
  blocked_id: string;

  @CreateDateColumn()
  created_at: Date;
}
