"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const admin_module_1 = require("./admin/admin.module");
const websocket_module_1 = require("./websocket/websocket.module");
const user_entity_1 = require("./entities/user.entity");
const song_entity_1 = require("./entities/song.entity");
const artist_entity_1 = require("./entities/artist.entity");
const category_entity_1 = require("./entities/category.entity");
const comment_entity_1 = require("./entities/comment.entity");
const listen_history_entity_1 = require("./entities/listen-history.entity");
const vip_purchase_entity_1 = require("./entities/vip-purchase.entity");
const vip_package_entity_1 = require("./entities/vip-package.entity");
const otp_entity_1 = require("./entities/otp.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: Number(process.env.DB_PORT) || 3306,
                username: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'music_db',
                entities: [user_entity_1.User, song_entity_1.Song, artist_entity_1.Artist, category_entity_1.Category, comment_entity_1.Comment, listen_history_entity_1.ListenHistory, vip_purchase_entity_1.VipPurchase, vip_package_entity_1.VipPackage, otp_entity_1.Otp],
                synchronize: false,
                extra: {
                    sql_mode: 'ALLOW_INVALID_DATES',
                },
            }),
            typeorm_1.TypeOrmModule.forFeature([listen_history_entity_1.ListenHistory]),
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map