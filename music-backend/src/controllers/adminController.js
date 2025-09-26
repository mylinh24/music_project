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
