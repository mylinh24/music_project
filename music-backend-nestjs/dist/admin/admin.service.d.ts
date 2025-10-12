import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Song } from '../entities/song.entity';
import { Artist } from '../entities/artist.entity';
import { Category } from '../entities/category.entity';
import { Comment } from '../entities/comment.entity';
import { VipPurchase } from '../entities/vip-purchase.entity';
import { VipPackage } from '../entities/vip-package.entity';
import { WebSocketGateway } from '../websocket/websocket.gateway';
export declare class AdminService {
    private userRepository;
    private songRepository;
    private artistRepository;
    private categoryRepository;
    private commentRepository;
    private vipPurchaseRepository;
    private vipPackageRepository;
    private webSocketGateway;
    constructor(userRepository: Repository<User>, songRepository: Repository<Song>, artistRepository: Repository<Artist>, categoryRepository: Repository<Category>, commentRepository: Repository<Comment>, vipPurchaseRepository: Repository<VipPurchase>, vipPackageRepository: Repository<VipPackage>, webSocketGateway: WebSocketGateway);
    getAllUsers(): Promise<User[]>;
    updateUserRole(id: number, role: 'user' | 'admin'): Promise<{
        message: string;
    }>;
    deleteUser(id: number): Promise<{
        message: string;
    }>;
    getUserById(id: number): Promise<User>;
    updateUser(id: number, updates: Partial<User>): Promise<{
        message: string;
    }>;
    getSongById(id: number): Promise<Song>;
    getAllSongs(query: any): Promise<Song[]>;
    updateSong(id: number, updates: Partial<Song>): Promise<{
        message: string;
    }>;
    deleteSong(id: number): Promise<{
        message: string;
    }>;
    createSong(songData: Partial<Song>): Promise<Song>;
    createArtist(artistData: Partial<Artist>): Promise<Artist>;
    getArtistById(id: number): Promise<Artist>;
    getAllArtists(): Promise<Artist[]>;
    updateArtist(id: number, updates: Partial<Artist>): Promise<{
        message: string;
    }>;
    deleteArtist(id: number): Promise<{
        message: string;
    }>;
    getAllCategories(): Promise<Category[]>;
    getDashboardStats(): Promise<any>;
    getRevenueStats(startDate?: string, endDate?: string): Promise<{
        totalRevenue: number;
    }>;
    getVipPurchasesList(limit?: number, offset?: number): Promise<VipPurchase[]>;
    getNewCustomers(days?: number): Promise<{
        count: number;
        customers: User[];
    }>;
    getTopVipPackages(): Promise<any[]>;
    getContributionPointsStats(): Promise<{
        totalPoints: number;
        pointsList: User[];
    }>;
    getMonthlyRevenueStats(): Promise<{
        labels: string[];
        values: number[];
    }>;
    getProfile(userId: number): Promise<User>;
}
