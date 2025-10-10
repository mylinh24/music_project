import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { WebSocketModule } from '../websocket/websocket.module';
import { User } from '../entities/user.entity';
import { Song } from '../entities/song.entity';
import { Artist } from '../entities/artist.entity';
import { Category } from '../entities/category.entity';
import { Comment } from '../entities/comment.entity';
import { VipPurchase } from '../entities/vip-purchase.entity';
import { VipPackage } from '../entities/vip-package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Song, Artist, Category, Comment, VipPurchase, VipPackage]),
    AuthModule,
    WebSocketModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
