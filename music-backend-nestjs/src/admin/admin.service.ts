import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, Brackets } from 'typeorm';
import { User } from '../entities/user.entity';
import { Song } from '../entities/song.entity';
import { Artist } from '../entities/artist.entity';
import { Category } from '../entities/category.entity';
import { Comment } from '../entities/comment.entity';
import { VipPurchase } from '../entities/vip-purchase.entity';
import { VipPackage } from '../entities/vip-package.entity';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(VipPurchase)
    private vipPurchaseRepository: Repository<VipPurchase>,
    @InjectRepository(VipPackage)
    private vipPackageRepository: Repository<VipPackage>,
    private webSocketGateway: WebSocketGateway,
  ) { }

  // User management
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'isVerified', 'vip', 'contributionPoints', 'role', 'referralCount'],
    });
  }

  async updateUserRole(id: number, role: 'user' | 'admin'): Promise<{ message: string }> {
    if (!['user', 'admin'].includes(role)) {
      throw new BadRequestException('Invalid role');
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = role;
    await this.userRepository.save(user);
    return { message: 'User role updated' };
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
    return { message: 'User deleted' };
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'isVerified', 'vip', 'contributionPoints', 'role', 'referralCount'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updates);
    await this.userRepository.save(user);
    return { message: 'User updated' };
  }

  // Song management
  async getSongById(id: number): Promise<Song> {
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
      throw new NotFoundException('Song not found');
    }
    return song;
  }

  async getAllSongs(query: any): Promise<Song[]> {
    const where: any = {};
    if (query.artist_id) {
      where.artist_id = +query.artist_id;
    }
    return this.songRepository.find({
      relations: ['artist', 'category'],
      where,
    });
  }

  async updateSong(id: number, updates: Partial<Song>): Promise<{ message: string }> {
    const song = await this.songRepository.findOne({ where: { id } });
    if (!song) {
      throw new NotFoundException('Song not found');
    }
    Object.assign(song, updates);
    await this.songRepository.save(song);
    return { message: 'Song updated' };
  }

  async deleteSong(id: number): Promise<{ message: string }> {
    const song = await this.songRepository.findOne({ where: { id } });
    if (!song) {
      throw new NotFoundException('Song not found');
    }
    await this.songRepository.remove(song);
    return { message: 'Song deleted' };
  }

  async createSong(songData: Partial<Song>): Promise<Song> {
    const { title, audio_url, artist_id, category_id, image_url, lyrics, release_date, exclusive } = songData;
    if (!title || !audio_url || !artist_id || !category_id) {
      throw new BadRequestException('Title, audio_url, artist_id, and category_id are required');
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

    // Broadcast notification to admins
    this.webSocketGateway.broadcastToAdmins({
      type: 'SONG_CREATED',
      message: `New song "${savedSong.title}" has been added`,
      data: { songId: savedSong.id, title: savedSong.title },
    });

    return savedSong;
  }

  async createArtist(artistData: Partial<Artist>): Promise<Artist> {
    const { name, image_url } = artistData;
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    const artist = this.artistRepository.create({
      name,
      image_url,
      totalListens: 0,
    });
    const savedArtist = await this.artistRepository.save(artist);

    // Broadcast notification to admins
    this.webSocketGateway.broadcastToAdmins({
      type: 'ARTIST_CREATED',
      message: `New artist "${savedArtist.name}" has been added`,
      data: { artistId: savedArtist.id, name: savedArtist.name },
    });

    return savedArtist;
  }

  async getArtistById(id: number): Promise<Artist> {
    const artist = await this.artistRepository.findOne({
      where: { id },
      select: ['id', 'name', 'image_url', 'totalListens'],
    });
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }
    return artist;
  }

  async getAllArtists(): Promise<Artist[]> {
    return this.artistRepository.find();
  }

  async updateArtist(id: number, updates: Partial<Artist>): Promise<{ message: string }> {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }
    Object.assign(artist, updates);
    await this.artistRepository.save(artist);
    return { message: 'Artist updated' };
  }

  async deleteArtist(id: number): Promise<{ message: string }> {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    // Check if artist has associated songs
    const songCount = await this.songRepository.count({ where: { artist_id: id } });
    if (songCount > 0) {
      throw new BadRequestException('Cannot delete artist because they have associated songs');
    }

    await this.artistRepository.remove(artist);
    return { message: 'Artist deleted' };
  }

  // Dashboard stats
  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      select: ['id', 'name'],
    });
  }

  async getDashboardStats(): Promise<any> {
    const userCount = await this.userRepository.count();
    const songCount = await this.songRepository.count();
    const artistCount = await this.artistRepository.count();
    const commentCount = await this.commentRepository.count();
    const pendingComments = await this.commentRepository.count({ where: { status: 'pending' } });
    const totalRevenue = await this.vipPurchaseRepository.sum('amount') || 0;
    const newCustomers = await this.userRepository.count({
      where: {
        createdAt: MoreThanOrEqual(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      },
    });
    return {
      users: userCount,
      songs: songCount,
      artists: artistCount,
      comments: commentCount,
      pendingComments,
      totalRevenue,
      newCustomers,
    };
  }

  // Revenue stats
  async getRevenueStats(startDate?: string, endDate?: string): Promise<{ totalRevenue: number }> {
    let query = this.vipPurchaseRepository.createQueryBuilder('vp').select('SUM(vp.amount)', 'total');
    if (startDate && endDate) {
      query = query.where('vp.payment_date BETWEEN :start AND :end', { start: new Date(startDate), end: new Date(endDate) });
    }
    const result = await query.getRawOne();
    const totalRevenue = parseFloat(result.total) || 0;
    return { totalRevenue };
  }

  // VIP purchases list
  async getVipPurchasesList(limit: number = 10, offset: number = 0): Promise<VipPurchase[]> {
    return this.vipPurchaseRepository
      .createQueryBuilder('vp')
      .leftJoinAndSelect('vp.user', 'user')
      .leftJoinAndSelect('vp.vipPackage', 'vipPackage')
      .select([
        'vp.id',
        'vp.payment_date',
        'vp.amount',
        'vp.points_used',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'vipPackage.id',
        'vipPackage.name',
        'vipPackage.price',
      ])
      .take(limit)
      .skip(offset)
      .orderBy('vp.payment_date', 'DESC')
      .getMany();
  }

  // New customers
  async getNewCustomers(days: number = 30): Promise<{ count: number; customers: User[] }> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const count = await this.userRepository.count({
      where: {
        createdAt: MoreThanOrEqual(startDate),
      },
    });
    const customers = await this.userRepository.find({
      where: {
        createdAt: MoreThanOrEqual(startDate),
      },
      select: ['id', 'email', 'firstName', 'lastName', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
    return { count, customers };
  }

  // Top VIP packages
  async getTopVipPackages(): Promise<any[]> {
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

  // Contribution points stats
  async getContributionPointsStats(): Promise<{ totalPoints: number; pointsList: User[] }> {
    const totalPoints = await this.userRepository.sum('contributionPoints') || 0;
    const pointsList = await this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'contributionPoints'],
      order: { contributionPoints: 'DESC' },
      take: 10,
    });
    return { totalPoints, pointsList };
  }

  // Monthly revenue stats
  async getMonthlyRevenueStats(): Promise<{ labels: string[]; values: number[] }> {
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

  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'firstName', 'lastName', 'avatar', 'role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Comment management
  async getAllComments(query: any): Promise<any> {
    const { page = 1, limit = 10, status, song_id, search } = query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let queryBuilder = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.song', 'song')
      .orderBy('comment.createdAt', 'DESC')
      .take(parseInt(limit))
      .skip(offset);

    if (status) {
      queryBuilder = queryBuilder.andWhere('comment.status = :status', { status });
    }
    if (song_id) {
      queryBuilder = queryBuilder.andWhere('comment.song_id = :song_id', { song_id: parseInt(song_id) });
    }

    // Add search functionality - match Express logic exactly
    if (search) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('comment.content LIKE :search', { search: `%${search}%` })
            .orWhere('CONCAT(user.firstName, \' \', user.lastName) LIKE :search', { search: `%${search}%` })
            .orWhere('user.email LIKE :search', { search: `%${search}%` });
        })
      );
    }

    const [comments, total] = await queryBuilder.getManyAndCount();

    return {
      comments,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_comments: total,
      },
    };
  }

  async deleteComment(id: number): Promise<{ message: string }> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.commentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

  async updateCommentStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<{ message: string }> {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new BadRequestException('Invalid status');
    }
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    comment.status = status;
    await this.commentRepository.save(comment);
    return { message: 'Comment status updated successfully' };
  }

  // VIP Package management
  async getAllVipPackages(): Promise<VipPackage[]> {
    return this.vipPackageRepository.find({
      order: { id: 'ASC' },
    });
  }

  async createVipPackage(vipPackageData: Partial<VipPackage>): Promise<VipPackage> {
    const { name, price, duration } = vipPackageData;
    if (!name || !price || !duration) {
      throw new BadRequestException('Name, price, and duration are required');
    }
    if (price <= 0 || duration <= 0) {
      throw new BadRequestException('Price and duration must be positive numbers');
    }

    const vipPackage = this.vipPackageRepository.create({
      name,
      price,
      duration,
    });
    return this.vipPackageRepository.save(vipPackage);
  }

  async updateVipPackage(id: number, updates: Partial<VipPackage>): Promise<{ message: string }> {
    const vipPackage = await this.vipPackageRepository.findOne({ where: { id } });
    if (!vipPackage) {
      throw new NotFoundException('VIP package not found');
    }

    if (updates.name !== undefined) vipPackage.name = updates.name;
    if (updates.price !== undefined) {
      if (updates.price <= 0) {
        throw new BadRequestException('Price must be a positive number');
      }
      vipPackage.price = updates.price;
    }
    if (updates.duration !== undefined) {
      if (updates.duration <= 0) {
        throw new BadRequestException('Duration must be a positive number');
      }
      vipPackage.duration = updates.duration;
    }

    await this.vipPackageRepository.save(vipPackage);
    return { message: 'VIP package updated successfully' };
  }

  async deleteVipPackage(id: number): Promise<{ message: string }> {
    const vipPackage = await this.vipPackageRepository.findOne({ where: { id } });
    if (!vipPackage) {
      throw new NotFoundException('VIP package not found');
    }

    // Check if package has associated purchases
    const purchaseCount = await this.vipPurchaseRepository.count({ where: { vippackage_id: id } });
    if (purchaseCount > 0) {
      throw new BadRequestException('Cannot delete VIP package because it has associated purchases');
    }

    await this.vipPackageRepository.remove(vipPackage);
    return { message: 'VIP package deleted successfully' };
  }
}
