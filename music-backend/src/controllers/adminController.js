import { Op, Sequelize } from 'sequelize';
import User from '../models/user.js';
import Song from '../models/song.js';
import Artist from '../models/artist.js';
import Category from '../models/category.js';
import Comment from '../models/comment.js';
import VipPurchase from '../models/vipPurchase.js';
import VipPackage from '../models/vipPackage.js';

// User management
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'isVerified', 'vip', 'contribution_points', 'role', 'referral_count'],
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.role = role;
    await user.save();
    res.json({ message: 'User role updated' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Song management
export const getSongById = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findByPk(id, {
      include: [
        { model: Artist, as: 'artist', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
      attributes: ['id', 'title', 'audio_url', 'image_url', 'lyrics', 'listen_count', 'release_date', 'exclusive'],
    });
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.findAll({
      include: [
        { model: Artist, as: 'artist', attributes: ['name'] },
        { model: Category, as: 'category', attributes: ['name'] },
      ],
      attributes: ['id', 'title', 'audio_url', 'image_url', 'listen_count', 'release_date', 'exclusive'],
    });
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSong = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const song = await Song.findByPk(id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    Object.assign(song, updates);
    await song.save();
    res.json({ message: 'Song updated' });
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findByPk(id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    await song.destroy();
    res.json({ message: 'Song deleted' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSong = async (req, res) => {
  try {
    const { title, audio_url, image_url, lyrics, artist_id, category_id, release_date, exclusive } = req.body;
    if (!title || !audio_url || !artist_id || !category_id) {
      return res.status(400).json({ error: 'Title, audio_url, artist_id, and category_id are required' });
    }
    const song = await Song.create({
      title,
      audio_url,
      image_url: image_url || null,
      lyrics: lyrics || null,
      artist_id,
      category_id,
      release_date: release_date || null,
      exclusive: exclusive || false,
      listen_count: 0,
    });
    res.status(201).json(song);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createArtist = async (req, res) => {
  try {
    const { name, image_url } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const artist = await Artist.create({
      name,
      image_url: image_url || null,
      total_listens: 0,
    });
    res.status(201).json(artist);
  } catch (error) {
    console.error('Error creating artist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await Artist.findByPk(id, {
      attributes: ['id', 'name', 'image_url', 'total_listens'],
    });
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.json(artist);
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Artist management
export const getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.findAll({
      attributes: ['id', 'name', 'image_url', 'total_listens'],
    });
    res.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    Object.assign(artist, updates);
    await artist.save();
    res.json({ message: 'Artist updated' });
  } catch (error) {
    console.error('Error updating artist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Check if artist has associated songs
    const songCount = await Song.count({ where: { artist_id: id } });
    if (songCount > 0) {
      return res.status(400).json({ error: 'Cannot delete artist because they have associated songs' });
    }

    await artist.destroy();
    res.json({ message: 'Artist deleted' });
  } catch (error) {
    console.error('Error deleting artist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Dashboard stats
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.count();
    const songCount = await Song.count();
    const artistCount = await Artist.count();
    const commentCount = await Comment.count();
    const pendingComments = await Comment.count({ where: { status: 'pending' } });
    const totalRevenue = await VipPurchase.sum('amount') || 0;
    const newCustomers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
        },
      },
    });
    res.json({
      users: userCount,
      songs: songCount,
      artists: artistCount,
      comments: commentCount,
      pendingComments,
      totalRevenue,
      newCustomers,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Revenue stats
export const getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.payment_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
    const totalRevenue = await VipPurchase.sum('amount', { where: whereClause }) || 0;
    res.json({ totalRevenue });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// VIP purchases list
export const getVipPurchasesList = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const purchases = await VipPurchase.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] },
        { model: VipPackage, as: 'vippackage', attributes: ['id', 'name', 'price'] },
      ],
      attributes: ['id', 'payment_date', 'amount', 'points_used'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['payment_date', 'DESC']],
    });
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching VIP purchases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// New customers
export const getNewCustomers = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const count = await User.count({
      where: {
        createdAt: {
          [Op.gte]: startDate,
        },
      },
    });
    const customers = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
        },
      },
      attributes: ['id', 'email', 'firstName', 'lastName', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json({ count, customers });
  } catch (error) {
    console.error('Error fetching new customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Top VIP packages
export const getTopVipPackages = async (req, res) => {
  try {
    const topPackages = await VipPurchase.findAll({
      attributes: [
        'vippackage_id',
        [Sequelize.fn('COUNT', Sequelize.col('vippackage_id')), 'purchaseCount'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalRevenue'],
      ],
      include: [
        { model: VipPackage, as: 'vippackage', attributes: ['name', 'price'] },
      ],
      group: ['vippackage_id', 'vippackage.id', 'vippackage.name', 'vippackage.price'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('vippackage_id')), 'DESC']],
      limit: 10,
    });
    res.json(topPackages);
  } catch (error) {
    console.error('Error fetching top VIP packages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Contribution points stats
export const getContributionPointsStats = async (req, res) => {
  try {
    const totalPoints = await User.sum('contribution_points') || 0;
    const pointsList = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'contribution_points'],
      order: [['contribution_points', 'DESC']],
      limit: 10,
    });
    res.json({ totalPoints, pointsList });
  } catch (error) {
    console.error('Error fetching contribution points stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Comment management
export const getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, song_id, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {};
    if (status) whereClause.status = status;
    if (song_id) whereClause.song_id = song_id;

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { content: { [Op.like]: `%${search}%` } },
        Sequelize.literal(`CONCAT(\`user\`.\`firstName\`, ' ', \`user\`.\`lastName\`) LIKE '%${search}%'`),
        Sequelize.literal(`\`user\`.\`email\` LIKE '%${search}%'`),
      ];
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Song,
          as: 'song',
          attributes: ['id', 'title'],
        },
      ],
      attributes: ['id', 'content', 'rating', 'status', 'created_at'],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      comments,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_comments: count,
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    comment.status = status;
    await comment.save();
    res.json({ message: 'Comment status updated successfully' });
  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Monthly revenue stats
export const getMonthlyRevenueStats = async (req, res) => {
  try {
    const monthlyRevenue = await VipPurchase.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('payment_date')), 'year'],
        [Sequelize.fn('MONTH', Sequelize.col('payment_date')), 'month'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalRevenue'],
      ],
      group: [Sequelize.fn('YEAR', Sequelize.col('payment_date')), Sequelize.fn('MONTH', Sequelize.col('payment_date'))],
      order: [[Sequelize.fn('YEAR', Sequelize.col('payment_date')), 'ASC'], [Sequelize.fn('MONTH', Sequelize.col('payment_date')), 'ASC']],
    });

    const labels = monthlyRevenue.map(item => `${item.dataValues.year}-${String(item.dataValues.month).padStart(2, '0')}`);
    const values = monthlyRevenue.map(item => parseFloat(item.dataValues.totalRevenue));

    res.json({ labels, values });
  } catch (error) {
    console.error('Error fetching monthly revenue stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// VIP Package management
export const getAllVipPackages = async (req, res) => {
  try {
    const packages = await VipPackage.findAll({
      attributes: ['id', 'name', 'price', 'duration'],
      order: [['id', 'ASC']],
    });
    res.json(packages);
  } catch (error) {
    console.error('Error fetching VIP packages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createVipPackage = async (req, res) => {
  try {
    const { name, price, duration } = req.body;
    if (!name || !price || !duration) {
      return res.status(400).json({ error: 'Name, price, and duration are required' });
    }
    if (price <= 0 || duration <= 0) {
      return res.status(400).json({ error: 'Price and duration must be positive numbers' });
    }

    const vipPackage = await VipPackage.create({
      name,
      price,
      duration,
    });
    res.status(201).json(vipPackage);
  } catch (error) {
    console.error('Error creating VIP package:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVipPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration } = req.body;

    const vipPackage = await VipPackage.findByPk(id);
    if (!vipPackage) {
      return res.status(404).json({ error: 'VIP package not found' });
    }

    if (name !== undefined) vipPackage.name = name;
    if (price !== undefined) {
      if (price <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      vipPackage.price = price;
    }
    if (duration !== undefined) {
      if (duration <= 0) {
        return res.status(400).json({ error: 'Duration must be a positive number' });
      }
      vipPackage.duration = duration;
    }

    await vipPackage.save();
    res.json({ message: 'VIP package updated successfully' });
  } catch (error) {
    console.error('Error updating VIP package:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVipPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const vipPackage = await VipPackage.findByPk(id);
    if (!vipPackage) {
      return res.status(404).json({ error: 'VIP package not found' });
    }

    // Check if package has associated purchases
    const purchaseCount = await VipPurchase.count({ where: { vippackage_id: id } });
    if (purchaseCount > 0) {
      return res.status(400).json({ error: 'Cannot delete VIP package because it has associated purchases' });
    }

    await vipPackage.destroy();
    res.json({ message: 'VIP package deleted successfully' });
  } catch (error) {
    console.error('Error deleting VIP package:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
