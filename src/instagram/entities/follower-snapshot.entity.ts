import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum SnapshotRelation {
  FOLLOWER = 'follower',
  FOLLOWING = 'following',
}

@Entity('followers_snapshot')
export class FollowerSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ type: 'enum', enum: SnapshotRelation })
  relation: SnapshotRelation;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  capturedAt: Date;
}
