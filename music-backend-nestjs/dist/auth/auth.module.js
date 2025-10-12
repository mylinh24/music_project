"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../entities/user.entity");
const otp_entity_1 = require("../entities/otp.entity");
const jwt_strategy_1 = require("./jwt.strategy");
const admin_guard_1 = require("./admin.guard");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const auth_controller_1 = require("./auth.controller");
const email_module_1 = require("../email/email.module");
const websocket_module_1 = require("../websocket/websocket.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, otp_entity_1.Otp]),
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    console.log('JWT_SECRET from ConfigService:', configService.get('JWT_SECRET'));
                    return {
                        secret: configService.get('JWT_SECRET'),
                        signOptions: { expiresIn: '24h' },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            email_module_1.EmailModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [jwt_strategy_1.JwtStrategy, admin_guard_1.AdminGuard, jwt_auth_guard_1.JwtAuthGuard],
        exports: [jwt_strategy_1.JwtStrategy, admin_guard_1.AdminGuard, jwt_auth_guard_1.JwtAuthGuard, jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map