"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const websocket_module_1 = require("../websocket/websocket.module");
const user_entity_1 = require("../entities/user.entity");
const song_entity_1 = require("../entities/song.entity");
const artist_entity_1 = require("../entities/artist.entity");
const category_entity_1 = require("../entities/category.entity");
const comment_entity_1 = require("../entities/comment.entity");
const vip_purchase_entity_1 = require("../entities/vip-purchase.entity");
const vip_package_entity_1 = require("../entities/vip-package.entity");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, song_entity_1.Song, artist_entity_1.Artist, category_entity_1.Category, comment_entity_1.Comment, vip_purchase_entity_1.VipPurchase, vip_package_entity_1.VipPackage]),
            auth_module_1.AuthModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map