import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { WebSocketModule } from './websocket/websocket.module';

import { User } from './entities/user.entity';
import { Song } from './entities/song.entity';
import { Artist } from './entities/artist.entity';
import { Category } from './entities/category.entity';
import { Comment } from './entities/comment.entity';
import { ListenHistory } from './entities/listen-history.entity';
import { VipPurchase } from './entities/vip-purchase.entity';
import { VipPackage } from './entities/vip-package.entity';
import { Otp } from './entities/otp.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'music_db',
      entities: [User, Song, Artist, Category, Comment, ListenHistory, VipPurchase, VipPackage, Otp],
      synchronize: false, // Set to false in production
      extra: {
        sql_mode: 'ALLOW_INVALID_DATES',
      },
    }),
    TypeOrmModule.forFeature([ListenHistory]),
    AuthModule,
    AdminModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
