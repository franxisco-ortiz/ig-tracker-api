import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { InstagramApiService } from './instagram-api.service';
import { InstagramCronService } from './instagram-cron.service';
import { FollowerSnapshot } from './entities/follower-snapshot.entity';
import { UnfollowEvent } from './entities/unfollow-event.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowerSnapshot, UnfollowEvent]),
    MailModule,
  ],
  controllers: [InstagramController],
  providers: [InstagramService, InstagramApiService, InstagramCronService],
})
export class InstagramModule {}
