import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Otp } from '../entities/otp.entity';
import { EmailService } from '../email/email.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
export declare class AuthController {
    private userRepository;
    private otpRepository;
    private jwtService;
    private emailService;
    private webSocketGateway;
    constructor(userRepository: Repository<User>, otpRepository: Repository<Otp>, jwtService: JwtService, emailService: EmailService, webSocketGateway: WebSocketGateway);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            role: "admin";
        };
    }>;
    register(body: any): Promise<{
        message: string;
        userId: any;
    }>;
    logout(): Promise<{
        message: string;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
        userId: number;
    }>;
    resetPassword(body: {
        userId: number;
        otp: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    verifyOtp(body: {
        userId: number;
        otp: string;
        type: 'register' | 'forgot';
    }): Promise<{
        message: string;
    }>;
    resendOtp(body: {
        email: string;
        type: 'register' | 'forgot';
    }): Promise<{
        message: string;
    }>;
    getMe(req: any): Promise<any>;
    private generateOTP;
}
