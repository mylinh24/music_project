import { Controller, Post, Body, UnauthorizedException, BadRequestException, HttpCode } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Otp } from '../entities/otp.entity';
import { EmailService } from '../email/email.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

const salt = bcrypt.genSaltSync(10);

@Controller()
export class AuthController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private webSocketGateway: WebSocketGateway,
  ) {}

  @Post('auth/login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Access denied');
    }
    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  @Post('auth/register')
  @HttpCode(201)
  async register(@Body() body: any) {
    const { email, password, firstName, lastName, referralCode } = body;
    try {
      console.log('Request body:', body);
      if (!email || !password || !firstName || !lastName) {
        throw new BadRequestException('Vui lòng cung cấp đầy đủ email, password, firstName, lastName');
      }

      let referredById: number | null = null;

      // Xử lý referral code nếu có
      if (referralCode) {
        const referredByUser = await this.userRepository.findOne({
          where: { referralCode }
        });

        if (referredByUser) {
          referredById = referredByUser.id;

          // Kiểm tra không được tự giới thiệu chính mình (skip if no userId in register)
        }
      }

      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser && existingUser.isVerified) {
        throw new BadRequestException('Email đã được sử dụng và xác thực');
      }

      let user;
      const now = new Date();
      if (existingUser && !existingUser.isVerified) {
        // Cập nhật thông tin user chưa xác thực
        const hashPassword = bcrypt.hashSync(password, salt);
        existingUser.password = hashPassword;
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        existingUser.updatedAt = now;
        user = await this.userRepository.save(existingUser);
      } else {
        // Tạo user mới
        const hashPassword = bcrypt.hashSync(password, salt);
        user = this.userRepository.create({
          email,
          password: hashPassword,
          firstName,
          lastName,
          role: 'admin',
          isVerified: false,
          referredBy: referredById ?? undefined,
          createdAt: now,
          updatedAt: now,
        });
        user = await this.userRepository.save(user);
      }
      console.log('User created/updated:', user.id);

      // Send notifications to admin
      const message = `New user registered: ${user.firstName} ${user.lastName} (${user.email})`;
      this.webSocketGateway.broadcastToAdmins({ type: 'new_user', message });
      try {
        await this.emailService.sendAdminNotification('New User Registration', message);
      } catch (emailError) {
        console.error('Failed to send admin email notification:', emailError);
      }

      // Xóa OTP cũ (nếu có)
      await this.otpRepository.delete({ userId: user.id, type: 'register' });

      // Tạo và gửi OTP mới
      const otp = this.generateOTP();
      console.log('Generated OTP:', otp);
      await this.emailService.sendOTP(email, otp, 'register');
      console.log('OTP sent to:', email);

      await this.otpRepository.save({
        userId: user.id,
        otp: bcrypt.hashSync(otp, salt),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        type: 'register',
        createdAt: now,
        updatedAt: now,
      });
      console.log('OTP saved to database');

      return { message: 'User registered. Check email for OTP.', userId: user.id };
    } catch (error) {
      console.error('Lỗi đăng ký:', error.message, error.stack);
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Error in registration');
    }
  }

  @Post('auth/logout')
  async logout() {
    // Logout chủ yếu do frontend xử lý bằng cách xóa token
    return { message: 'Logged out successfully' };
  }

  @Post('auth/forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    const { email } = body;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email not found');
    }

    // Xóa các OTP cũ của user này trước khi tạo OTP mới
    await this.otpRepository.delete({ userId: user.id, type: 'forgot' });

    const otp = this.generateOTP();
    const hashedOtp = bcrypt.hashSync(otp, salt);
    const now = new Date();
    await this.otpRepository.save({
      userId: user.id,
      otp: hashedOtp,
      type: 'forgot',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    });

    try {
      await this.emailService.sendOTP(email, otp, 'forgot');
    } catch (error) {
      console.error('Failed to send OTP email:', error.message);
      // Continue without throwing, as per some implementations
    }

    return { message: 'OTP sent to email', userId: user.id };
  }


  @Post('auth/reset-password')
  async resetPassword(@Body() body: { userId: number; otp: string; newPassword: string }) {
    const { userId, otp, newPassword } = body;
    console.log('Received userId:', userId);
    // Tìm OTP mới nhất cho user, sắp xếp theo id giảm dần
    const otpRecords = await this.otpRepository.find({
      where: { userId, type: 'forgot' },
      order: { id: 'DESC' },
    });
    const otpRecord = otpRecords[0];

    console.log('Received OTP:', otp);
    console.log('Stored hash:', otpRecord ? otpRecord.otp : 'No record');
    if (otpRecord) {
      const isValid = bcrypt.compareSync(otp, otpRecord.otp);
      console.log('Comparison result:', isValid);
    }

    if (!otpRecord) {
      console.log('No OTP record found');
      throw new BadRequestException('OTP không tồn tại');
    }
    if (otpRecord.expiresAt < new Date()) {
      console.log('OTP expired');
      throw new BadRequestException('OTP đã hết hạn');
    }

    const isValid = bcrypt.compareSync(otp, otpRecord.otp);
    if (!isValid) {
      console.log('OTP invalid');
      throw new BadRequestException('OTP không hợp lệ');
    }
    console.log('OTP valid, proceeding to update password');

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    console.log('User found:', user ? user.email : 'No user');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.password = hashedPassword;
    const savedUser = await this.userRepository.save(user);
    console.log('User saved:', savedUser ? 'Success' : 'Failed');

    // Xóa tất cả OTP của user này sau khi reset thành công
    await this.otpRepository.delete({ userId, type: 'forgot' });
    console.log('OTP deleted');

    console.log('Reset password successful');
    return { message: 'Đặt lại mật khẩu thành công' };
  }

  @Post('auth/verify-otp')
  async verifyOtp(@Body() body: { userId: number; otp: string; type: 'register' | 'forgot' }) {
    const { userId, otp, type } = body;
    const otpRecord = await this.otpRepository.findOne({
      where: { userId, type: type as 'register' | 'forgot' },
      order: { id: 'DESC' },
    });
    if (!otpRecord) {
      throw new BadRequestException('OTP không tồn tại');
    }
    if (otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('OTP đã hết hạn');
    }
    const isValid = bcrypt.compareSync(otp, otpRecord.otp);
    if (!isValid) {
      throw new BadRequestException('OTP không hợp lệ');
    }
    if (type === 'register') {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      user.isVerified = true;
      await this.userRepository.save(user);
    }
    await this.otpRepository.delete({ userId, type: type as 'register' | 'forgot' });
    return { message: 'OTP verified successfully' };
  }

  @Post('auth/resend-otp')
  async resendOtp(@Body() body: { email: string; type: 'register' | 'forgot' }) {
    const { email, type } = body;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.otpRepository.delete({ userId: user.id, type: type as 'register' | 'forgot' });
    const otp = this.generateOTP();
    await this.emailService.sendOTP(email, otp, type);
    await this.otpRepository.save({
      userId: user.id,
      otp: bcrypt.hashSync(otp, salt),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { message: 'OTP resent' };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
