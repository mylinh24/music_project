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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const song_entity_1 = require("../entities/song.entity");
const artist_entity_1 = require("../entities/artist.entity");
const category_entity_1 = require("../entities/category.entity");
const comment_entity_1 = require("../entities/comment.entity");
const vip_purchase_entity_1 = require("../entities/vip-purchase.entity");
const vip_package_entity_1 = require("../entities/vip-package.entity");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
let AdminService = class AdminService {
    userRepository;
    songRepository;
    artistRepository;
    categoryRepository;
    commentRepository;
    vipPurchaseRepository;
    vipPackageRepository;
    webSocketGateway;
    constructor(userRepository, songRepository, artistRepository, categoryRepository, commentRepository, vipPurchaseRepository, vipPackageRepository, webSocketGateway) {
        this.userRepository = userRepository;
        this.songRepository = songRepository;
        this.artistRepository = artistRepository;
        this.categoryRepository = categoryRepository;
        this.commentRepository = commentRepository;
        this.vipPurchaseRepository = vipPurchaseRepository;
        this.vipPackageRepository = vipPackageRepository;
        this.webSocketGateway = webSocketGateway;
    }
    async getAllUsers() {
        return this.userRepository.find({
            select: ['id', 'email', 'firstName', 'lastName', 'isVerified', 'vip', 'contributionPoints', 'role', 'referralCount'],
        });
    }
    async updateUserRole(id, role) {
        if (!['user', 'admin'].includes(role)) {
            throw new common_1.BadRequestException('Invalid role');
        }
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.role = role;
        await this.userRepository.save(user);
        return { message: 'User role updated' };
    }
    async deleteUser(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.userRepository.remove(user);
        return { message: 'User deleted' };
    }
    async getUserById(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'email', 'firstName', 'lastName', 'isVerified', 'vip', 'contributionPoints', 'role', 'referralCount'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateUser(id, updates) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        Object.assign(user, updates);
        await this.userRepository.save(user);
        return { message: 'User updated' };
    }
    async getSongById(id) {
        const song = await this.songRepository.findOne({
            where: { id },
            relations: ['artist', 'category'],
            select: {
                id: true,
                title: true,
                audio_url: true,
                image_url: true,
                lyrics: true,
                listenCount: true,
                release_date: true,
                exclusive: true,
                artist: { id: true, name: true },
                category: { id: true, name: true },
            },
        });
        if (!song) {
            throw new common_1.NotFoundException('Song not found');
        }
        return song;
    }
    async getAllSongs(query) {
        const where = {};
        if (query.artist_id) {
            where.artist_id = +query.artist_id;
        }
        return this.songRepository.find({
            relations: ['artist', 'category'],
            where,
        });
    }
    async updateSong(id, updates) {
        const song = await this.songRepository.findOne({ where: { id } });
        if (!song) {
            throw new common_1.NotFoundException('Song not found');
        }
        Object.assign(song, updates);
        await this.songRepository.save(song);
        return { message: 'Song updated' };
    }
    async deleteSong(id) {
        const song = await this.songRepository.findOne({ where: { id } });
        if (!song) {
            throw new common_1.NotFoundException('Song not found');
        }
        await this.songRepository.remove(song);
        return { message: 'Song deleted' };
    }
    async createSong(songData) {
        const { title, audio_url, artist_id, category_id, image_url, lyrics, release_date, exclusive } = songData;
        if (!title || !audio_url || !artist_id || !category_id) {
            throw new common_1.BadRequestException('Title, audio_url, artist_id, and category_id are required');
        }
        const song = this.songRepository.create({
            title,
            audio_url,
            image_url,
            lyrics,
            artist_id,
            category_id,
            release_date,
            exclusive,
            listenCount: 0,
        });
        const savedSong = await this.songRepository.save(song);
        this.webSocketGateway.broadcastToAdmins({
            type: 'SONG_CREATED',
            message: `New song "${savedSong.title}" has been added`,
            data: { songId: savedSong.id, title: savedSong.title },
        });
        return savedSong;
    }
    async createArtist(artistData) {
        const { name, image_url } = artistData;
        if (!name) {
            throw new common_1.BadRequestException('Name is required');
        }
        const artist = this.artistRepository.create({
            name,
            image_url,
            totalListens: 0,
        });
        const savedArtist = await this.artistRepository.save(artist);
        this.webSocketGateway.broadcastToAdmins({
            type: 'ARTIST_CREATED',
            message: `New artist "${savedArtist.name}" has been added`,
            data: { artistId: savedArtist.id, name: savedArtist.name },
        });
        return savedArtist;
    }
    async getArtistById(id) {
        const artist = await this.artistRepository.findOne({
            where: { id },
            select: ['id', 'name', 'image_url', 'totalListens'],
        });
        if (!artist) {
            throw new common_1.NotFoundException('Artist not found');
        }
        return artist;
    }
    async getAllArtists() {
        return this.artistRepository.find();
    }
    async updateArtist(id, updates) {
        const artist = await this.artistRepository.findOne({ where: { id } });
        if (!artist) {
            throw new common_1.NotFoundException('Artist not found');
        }
        Object.assign(artist, updates);
        await this.artistRepository.save(artist);
        return { message: 'Artist updated' };
    }
    async deleteArtist(id) {
        const artist = await this.artistRepository.findOne({ where: { id } });
        if (!artist) {
            throw new common_1.NotFoundException('Artist not found');
        }
        const songCount = await this.songRepository.count({ where: { artist_id: id } });
        if (songCount > 0) {
            throw new common_1.BadRequestException('Cannot delete artist because they have associated songs');
        }
        await this.artistRepository.remove(artist);
        return { message: 'Artist deleted' };
    }
    async getAllCategories() {
        return this.categoryRepository.find({
            select: ['id', 'name'],
        });
    }
    async getDashboardStats() {
        const userCount = await this.userRepository.count();
        const songCount = await this.songRepository.count();
        const artistCount = await this.artistRepository.count();
        const commentCount = await this.commentRepository.count();
        const totalRevenue = await this.vipPurchaseRepository.sum('amount') || 0;
        const newCustomers = await this.userRepository.count({
            where: {
                createdAt: (0, typeorm_2.MoreThanOrEqual)(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
            },
        });
        return {
            users: userCount,
            songs: songCount,
            artists: artistCount,
            comments: commentCount,
            totalRevenue,
            newCustomers,
        };
    }
    async getRevenueStats(startDate, endDate) {
        let query = this.vipPurchaseRepository.createQueryBuilder('vp').select('SUM(vp.amount)', 'total');
        if (startDate && endDate) {
            query = query.where('vp.payment_date BETWEEN :start AND :end', { start: new Date(startDate), end: new Date(endDate) });
        }
        const result = await query.getRawOne();
        const totalRevenue = parseFloat(result.total) || 0;
        return { totalRevenue };
    }
    async getVipPurchasesList(limit = 10, offset = 0) {
        return this.vipPurchaseRepository.find({
            relations: ['vipPackage'],
            select: ['id', 'payment_date', 'amount', 'points_used'],
            take: limit,
            skip: offset,
            order: { payment_date: 'DESC' },
        });
    }
    async getNewCustomers(days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const count = await this.userRepository.count({
            where: {
                createdAt: (0, typeorm_2.MoreThanOrEqual)(startDate),
            },
        });
        const customers = await this.userRepository.find({
            where: {
                createdAt: (0, typeorm_2.MoreThanOrEqual)(startDate),
            },
            select: ['id', 'email', 'firstName', 'lastName', 'createdAt'],
            order: { createdAt: 'DESC' },
        });
        return { count, customers };
    }
    async getTopVipPackages() {
        return this.vipPurchaseRepository
            .createQueryBuilder('vp')
            .select('vp.vippackage_id', 'vippackage_id')
            .addSelect('COUNT(vp.vippackage_id)', 'purchaseCount')
            .addSelect('SUM(vp.amount)', 'totalRevenue')
            .leftJoin('vp.vipPackage', 'vipPackage')
            .addSelect('vipPackage.name', 'name')
            .addSelect('vipPackage.price', 'price')
            .groupBy('vp.vippackage_id')
            .addGroupBy('vipPackage.id')
            .addGroupBy('vipPackage.name')
            .addGroupBy('vipPackage.price')
            .orderBy('COUNT(vp.vippackage_id)', 'DESC')
            .limit(10)
            .getRawMany();
    }
    async getContributionPointsStats() {
        const totalPoints = await this.userRepository.sum('contributionPoints') || 0;
        const pointsList = await this.userRepository.find({
            select: ['id', 'email', 'firstName', 'lastName', 'contributionPoints'],
            order: { contributionPoints: 'DESC' },
            take: 10,
        });
        return { totalPoints, pointsList };
    }
    async getMonthlyRevenueStats() {
        const monthlyRevenue = await this.vipPurchaseRepository
            .createQueryBuilder('vp')
            .select('YEAR(vp.payment_date)', 'year')
            .addSelect('MONTH(vp.payment_date)', 'month')
            .addSelect('SUM(vp.amount)', 'totalRevenue')
            .groupBy('YEAR(vp.payment_date)')
            .addGroupBy('MONTH(vp.payment_date)')
            .orderBy('YEAR(vp.payment_date)', 'ASC')
            .addOrderBy('MONTH(vp.payment_date)', 'ASC')
            .getRawMany();
        const labels = monthlyRevenue.map(item => `${item.year}-${String(item.month).padStart(2, '0')}`);
        const values = monthlyRevenue.map(item => parseFloat(item.totalRevenue));
        return { labels, values };
    }
    async getProfile(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'email', 'firstName', 'lastName', 'avatar', 'role'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(song_entity_1.Song)),
    __param(2, (0, typeorm_1.InjectRepository)(artist_entity_1.Artist)),
    __param(3, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(4, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(5, (0, typeorm_1.InjectRepository)(vip_purchase_entity_1.VipPurchase)),
    __param(6, (0, typeorm_1.InjectRepository)(vip_package_entity_1.VipPackage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        websocket_gateway_1.WebSocketGateway])
], AdminService);
//# sourceMappingURL=admin.service.js.map