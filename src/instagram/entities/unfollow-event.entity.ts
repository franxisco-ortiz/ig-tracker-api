import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('unfollow_events')
export class UnfollowEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  unfollowedAt: Date;
}
