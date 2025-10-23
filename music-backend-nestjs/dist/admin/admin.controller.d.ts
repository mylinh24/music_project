import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAllUsers(): Promise<import("../entities/user.entity").User[]>;
    getUserById(id: string): Promise<import("../entities/user.entity").User>;
    updateUser(id: string, body: any): Promise<{
        message: string;
    }>;
    updateUserRole(id: string, body: {
        role: 'user' | 'admin';
    }): Promise<{
        message: string;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    createSong(body: any): Promise<import("../entities/song.entity").Song>;
    getAllSongs(query: any): Promise<import("../entities/song.entity").Song[]>;
    getSongById(id: string): Promise<import("../entities/song.entity").Song>;
    updateSong(id: string, body: any): Promise<{
        message: string;
    }>;
    deleteSong(id: string): Promise<{
        message: string;
    }>;
    createArtist(body: any): Promise<import("../entities/artist.entity").Artist>;
    getAllArtists(): Promise<import("../entities/artist.entity").Artist[]>;
    getArtistById(id: string): Promise<import("../entities/artist.entity").Artist>;
    updateArtist(id: string, body: any): Promise<{
        message: string;
    }>;
    deleteArtist(id: string): Promise<{
        message: string;
    }>;
    getAllCategories(): Promise<import("../entities/category.entity").Category[]>;
    getDashboardStats(): Promise<any>;
    getRevenueStats(startDate: string, endDate: string): Promise<{
        totalRevenue: number;
    }>;
    getMonthlyRevenueStats(): Promise<{
        labels: string[];
        values: number[];
    }>;
    getVipPurchasesList(limit: string, offset: string): Promise<import("../entities/vip-purchase.entity").VipPurchase[]>;
    getNewCustomers(days: string): Promise<{
        count: number;
        customers: import("../entities/user.entity").User[];
    }>;
    getTopVipPackages(): Promise<any[]>;
    getContributionPointsStats(): Promise<{
        totalPoints: number;
        pointsList: import("../entities/user.entity").User[];
    }>;
    getProfile(req: any): Promise<import("../entities/user.entity").User>;
    getAllComments(query: any): Promise<any>;
    deleteComment(id: string): Promise<{
        message: string;
    }>;
    updateCommentStatus(id: string, body: {
        status: 'pending' | 'approved' | 'rejected';
    }): Promise<{
        message: string;
    }>;
    getAllVipPackages(): Promise<import("../entities/vip-package.entity").VipPackage[]>;
    createVipPackage(vipPackageData: any): Promise<import("../entities/vip-package.entity").VipPackage>;
    updateVipPackage(id: string, updates: any): Promise<{
        message: string;
    }>;
    deleteVipPackage(id: string): Promise<{
        message: string;
    }>;
}
