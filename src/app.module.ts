import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstagramModule } from './instagram/instagram.module';
import { FollowerSnapshot } from './instagram/entities/follower-snapshot.entity';
import { UnfollowEvent } from './instagram/entities/unfollow-event.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [FollowerSnapshot, UnfollowEvent],
      synchronize: true,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
    }),
    InstagramModule,
  ],
})
export class AppModule {}
