import { Controller, Get, Post } from '@nestjs/common';
import { InstagramService, SyncResult } from './instagram.service';
import { UnfollowEvent } from './entities/unfollow-event.entity';

@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Post('sync')
  sync(): Promise<SyncResult> {
    return this.instagramService.sync();
  }

  @Get('unfollowers')
  getUnfollowers(): Promise<string[]> {
    return this.instagramService.getUnfollowers();
  }

  @Get('history')
  getHistory(): Promise<UnfollowEvent[]> {
    return this.instagramService.getHistory();
  }
}
