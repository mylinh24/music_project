"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../entities/user.entity");
const otp_entity_1 = require("../entities/otp.entity");
const email_service_1 = require("../email/email.service");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const admin_guard_1 = require("./admin.guard");
const salt = bcrypt.genSaltSync(10);
let AuthController = class AuthController {
    userRepository;
    otpRepository;
    jwtService;
    emailService;
    webSocketGateway;
    constructor(userRepository, otpRepository, jwtService, emailService, webSocketGateway) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.webSocketGateway = webSocketGateway;
    }
    async login(body) {
        const { email, password } = body;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.role !== 'admin') {
            throw new common_1.UnauthorizedException('Access denied');
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
    async register(body) {
        const { email, password, firstName, lastName, referralCode } = body;
        try {
            console.log('Request body:', body);
            if (!email || !password || !firstName || !lastName) {
                throw new common_1.BadRequestException('Vui lòng cung cấp đầy đủ email, password, firstName, lastName');
            }
            let referredById = null;
            if (referralCode) {
                const referredByUser = await this.userRepository.findOne({
                    where: { referralCode }
                });
                if (referredByUser) {
                    referredById = referredByUser.id;
                }
            }
            const existingUser = await this.userRepository.findOne({ where: { email } });
            if (existingUser && existingUser.isVerified) {
                throw new common_1.BadRequestException('Email đã được sử dụng và xác thực');
            }
            let user;
            const now = new Date();
            if (existingUser && !existingUser.isVerified) {
                const hashPassword = bcrypt.hashSync(password, salt);
                existingUser.password = hashPassword;
                existingUser.firstName = firstName;
                existingUser.lastName = lastName;
                existingUser.updatedAt = now;
                user = await this.userRepository.save(existingUser);
            }
            else {
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
            const message = `New user registered: ${user.firstName} ${user.lastName} (${user.email})`;
            this.webSocketGateway.broadcastToAdmins({ type: 'new_user', message });
            try {
                await this.emailService.sendAdminNotification('New User Registration', message);
            }
            catch (emailError) {
                console.error('Failed to send admin email notification:', emailError);
            }
            await this.otpRepository.delete({ userId: user.id, type: 'register' });
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
        }
        catch (error) {
            console.error('Lỗi đăng ký:', error.message, error.stack);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error in registration');
        }
    }
    async logout() {
        return { message: 'Logged out successfully' };
    }
    async forgotPassword(body) {
        const { email } = body;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Email not found');
        }
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
        }
        catch (error) {
            console.error('Failed to send OTP email:', error.message);
        }
        return { message: 'OTP sent to email', userId: user.id };
    }
    async resetPassword(body) {
        const { userId, otp, newPassword } = body;
        console.log('Received userId:', userId);
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
            throw new common_1.BadRequestException('OTP không tồn tại');
        }
        if (otpRecord.expiresAt < new Date()) {
            console.log('OTP expired');
            throw new common_1.BadRequestException('OTP đã hết hạn');
        }
        const isValid = bcrypt.compareSync(otp, otpRecord.otp);
        if (!isValid) {
            console.log('OTP invalid');
            throw new common_1.BadRequestException('OTP không hợp lệ');
        }
        console.log('OTP valid, proceeding to update password');
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        console.log('User found:', user ? user.email : 'No user');
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        user.password = hashedPassword;
        const savedUser = await this.userRepository.save(user);
        console.log('User saved:', savedUser ? 'Success' : 'Failed');
        await this.otpRepository.delete({ userId, type: 'forgot' });
        console.log('OTP deleted');
        console.log('Reset password successful');
        return { message: 'Đặt lại mật khẩu thành công' };
    }
    async verifyOtp(body) {
        const { userId, otp, type } = body;
        const otpRecord = await this.otpRepository.findOne({
            where: { userId, type: type },
            order: { id: 'DESC' },
        });
        if (!otpRecord) {
            throw new common_1.BadRequestException('OTP không tồn tại');
        }
        if (otpRecord.expiresAt < new Date()) {
            throw new common_1.BadRequestException('OTP đã hết hạn');
        }
        const isValid = bcrypt.compareSync(otp, otpRecord.otp);
        if (!isValid) {
            throw new common_1.BadRequestException('OTP không hợp lệ');
        }
        if (type === 'register') {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            user.isVerified = true;
            await this.userRepository.save(user);
        }
        await this.otpRepository.delete({ userId, type: type });
        return { message: 'OTP verified successfully' };
    }
    async resendOtp(body) {
        const { email, type } = body;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        await this.otpRepository.delete({ userId: user.id, type: type });
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
    async getMe(req) {
        const userId = req.user.userId;
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'email', 'firstName', 'lastName', 'avatar', 'role'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const response = { ...user };
        if (response.avatar && Buffer.isBuffer(response.avatar)) {
            response.avatar = `data:image/png;base64,${response.avatar.toString('base64')}`;
        }
        return response;
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('auth/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('auth/register'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('auth/logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('auth/forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('auth/reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('auth/verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('auth/resend-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOtp", null);
__decorate([
    (0, common_1.Get)('auth/me'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(otp_entity_1.Otp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        email_service_1.EmailService,
        websocket_gateway_1.WebSocketGateway])
], AuthController);
//# sourceMappingURL=auth.controller.js.map