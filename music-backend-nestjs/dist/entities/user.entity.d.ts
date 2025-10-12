export declare class User {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    avatar: Buffer;
    vip: boolean;
    contributionPoints: number;
    referralCode: string;
    referredBy: number;
    referralCount: number;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}
