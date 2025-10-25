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
exports.VipPurchase = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const vip_package_entity_1 = require("./vip-package.entity");
let VipPurchase = class VipPurchase {
    id;
    user_id;
    payment_date;
    expiry_date;
    amount;
    points_used;
    vippackage_id;
    user;
    vipPackage;
};
exports.VipPurchase = VipPurchase;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VipPurchase.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], VipPurchase.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_date', type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], VipPurchase.prototype, "payment_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_date', type: 'datetime', nullable: false }),
    __metadata("design:type", Date)
], VipPurchase.prototype, "expiry_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], VipPurchase.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'points_used', type: 'int', nullable: false, default: 0 }),
    __metadata("design:type", Number)
], VipPurchase.prototype, "points_used", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vippackage_id', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], VipPurchase.prototype, "vippackage_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], VipPurchase.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vip_package_entity_1.VipPackage),
    (0, typeorm_1.JoinColumn)({ name: 'vippackage_id' }),
    __metadata("design:type", vip_package_entity_1.VipPackage)
], VipPurchase.prototype, "vipPackage", void 0);
exports.VipPurchase = VipPurchase = __decorate([
    (0, typeorm_1.Entity)('vip_purchases')
], VipPurchase);
//# sourceMappingURL=vip-purchase.entity.js.map