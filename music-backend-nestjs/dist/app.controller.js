"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const app_service_1 = require("./app.service");
const listen_history_entity_1 = require("./entities/listen-history.entity");
let AppController = class AppController {
    appService;
    listenHistoryRepository;
    constructor(appService, listenHistoryRepository) {
        this.appService = appService;
        this.listenHistoryRepository = listenHistoryRepository;
    }
    getHello() {
        return this.appService.getHello();
    }
    async recordListen(body) {
        const listenHistory = this.listenHistoryRepository.create({
            song_id: body.song_id,
            user_id: body.user_id,
        });
        await this.listenHistoryRepository.save(listenHistory);
        return { message: 'Listen recorded' };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Post)('listen-history'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "recordListen", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)('api'),
    __param(1, (0, typeorm_1.InjectRepository)(listen_history_entity_1.ListenHistory)),
    __metadata("design:paramtypes", [app_service_1.AppService,
        typeorm_2.Repository])
], AppController);
//# sourceMappingURL=app.controller.js.map