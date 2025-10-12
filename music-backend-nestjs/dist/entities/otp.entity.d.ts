import { User } from './user.entity';
export declare class Otp {
    id: number;
    userId: number;
    user: User;
    otp: string;
    type: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
