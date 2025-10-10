import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Otp } from '../entities/otp.entity';
import { JwtStrategy } from './jwt.strategy';
import { AdminGuard } from './admin.guard';
import { AuthController } from './auth.controller';
import { EmailModule } from '../email/email.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Otp]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log('JWT_SECRET from ConfigService:', configService.get<string>('JWT_SECRET'));
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '24h' },
        };
      },
      inject: [ConfigService],
    }),
    EmailModule,
    WebSocketModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AdminGuard],
  exports: [JwtStrategy, AdminGuard, JwtModule],
})
export class AuthModule {}
