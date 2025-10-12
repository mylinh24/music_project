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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenHistory = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const song_entity_1 = require("./song.entity");
let ListenHistory = class ListenHistory {
    id;
    user_id;
    song_id;
    listenedAt;
    user;
    song;
};
exports.ListenHistory = ListenHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ListenHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ListenHistory.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], ListenHistory.prototype, "song_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'listened_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], ListenHistory.prototype, "listenedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ListenHistory.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => song_entity_1.Song, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'song_id' }),
    __metadata("design:type", song_entity_1.Song)
], ListenHistory.prototype, "song", void 0);
exports.ListenHistory = ListenHistory = __decorate([
    (0, typeorm_1.Entity)('listen_history')
], ListenHistory);
//# sourceMappingURL=listen-history.entity.js.map