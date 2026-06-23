import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstagramApiService } from './instagram-api.service';
import {
  FollowerSnapshot,
  SnapshotRelation,
} from './entities/follower-snapshot.entity';
import { UnfollowEvent } from './entities/unfollow-event.entity';

export interface SyncResult {
  followingCount: number;
  followersCount: number;
  notFollowingBack: string[];
  newUnfollows: string[];
}

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  constructor(
    private readonly igApi: InstagramApiService,
    @InjectRepository(FollowerSnapshot)
    private readonly snapshotRepo: Repository<FollowerSnapshot>,
    @InjectRepository(UnfollowEvent)
    private readonly unfollowEventRepo: Repository<UnfollowEvent>,
  ) {}

  async sync(): Promise<SyncResult> {
    const [following, followers] = await Promise.all([
      this.igApi.getFollowing(),
      this.igApi.getFollowers(),
    ]);

    const previousFollowers = await this.snapshotRepo.find({
      where: { relation: SnapshotRelation.FOLLOWER },
    });

    const currentFollowersSet = new Set(followers);
    const newUnfollows = previousFollowers
      .map((row) => row.username)
      .filter((username) => !currentFollowersSet.has(username));

    if (newUnfollows.length > 0) {
      await this.unfollowEventRepo.insert(
        newUnfollows.map((username) => ({ username })),
      );
    }

    await this.snapshotRepo.clear();
    const rows = [
      ...followers.map((username) => ({
        username,
        relation: SnapshotRelation.FOLLOWER,
      })),
      ...following.map((username) => ({
        username,
        relation: SnapshotRelation.FOLLOWING,
      })),
    ];
    await this.snapshotRepo.save(rows);

    const followersSet = currentFollowersSet;
    const notFollowingBack = following.filter((u) => !followersSet.has(u));

    this.logger.log(
      `Sync completo: sigues a ${following.length}, te siguen ${followers.length}, nuevos unfollows ${newUnfollows.length}`,
    );

    return {
      followingCount: following.length,
      followersCount: followers.length,
      notFollowingBack,
      newUnfollows,
    };
  }

  async getUnfollowers(): Promise<string[]> {
    const rows = await this.snapshotRepo.find();
    const followers = new Set(
      rows
        .filter((r) => r.relation === SnapshotRelation.FOLLOWER)
        .map((r) => r.username),
    );
    return rows
      .filter((r) => r.relation === SnapshotRelation.FOLLOWING)
      .map((r) => r.username)
      .filter((username) => !followers.has(username));
  }

  async getHistory(): Promise<UnfollowEvent[]> {
    return this.unfollowEventRepo.find({
      order: { unfollowedAt: 'DESC' },
    });
  }
}
