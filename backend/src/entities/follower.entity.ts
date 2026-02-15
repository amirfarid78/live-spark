import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('followers')
@Index(['follower_id', 'following_id'], { unique: true })
export class Follower {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  follower_id: string;

  @Column()
  @Index()
  following_id: string;

  @CreateDateColumn()
  created_at: Date;
}
