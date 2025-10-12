import { VipPackage } from './vip-package.entity';
export declare class VipPurchase {
    id: number;
    user_id: number;
    payment_date: Date;
    expiry_date: Date;
    amount: number;
    points_used: number;
    vippackage_id: number;
    vipPackage: VipPackage;
}
