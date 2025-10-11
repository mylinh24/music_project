import Song from '../models/song.js';
import Artist from '../models/artist.js';
import Category from '../models/category.js';
import User from '../models/user.js';
import Sequelize from 'sequelize';
import { Op } from 'sequelize';

export const getSongsByCategory = async (req, res) => {
  try {
    const categoryName = req.params.category;
    const { page, limit } = req.query;
    if (!categoryName) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    let queryLimit = parseInt(limit) || 20;
    let offset = 0;

    if (page) {
      offset = (parseInt(page) - 1) * queryLimit;
    }

    const songs = await Song.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          where: { name: categoryName },
          attributes: [],
        },
        {
          model: Artist,
          as: 'artist',
          attributes: ['name'],
        },
      ],
      attributes: ['id', 'title', 'audio_url', 'image_url', 'listen_count', 'release_date', 'exclusive'],
      limit: queryLimit,
      offset,
    });

    const formattedSongs = songs.map(song => ({
      id: song.id,
      title: song.title,
      artist_name: song.artist ? song.artist.name : 'Unknown artist',
      audio_url: song.audio_url,
      image_url: song.image_url,
      listen_count: song.listen_count,
      release_date: song.release_date,
      exclusive: song.exclusive,
    }));

    res.json(formattedSongs);
  } catch (error) {
    console.error('Error fetching songs by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSongDetail = async (req, res) => {
  try {
    const songId = req.params.id;
    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required.' });
    }

    // Get user VIP status
    let isVip = false;
    if (req.userId) {
      const user = await User.findByPk(req.userId);
      if (user) {
        isVip = user.vip;
      }
    }

    // Build where clause for artist songs
    const artistSongsWhere = {};
    if (!isVip) {
      artistSongsWhere.exclusive = 0;
    }

    const song = await Song.findByPk(songId, {
      attributes: ['id', 'title', 'lyrics', 'audio_url', 'image_url', 'release_date', 'listen_count', 'artist_id', 'exclusive'],
      include: [
        { model: Artist, as: 'artist', attributes: ['id', 'name', 'image_url', 'total_listens'] },
        { model: Category, as: 'category', attributes: ['name'] },
      ],
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found.' });
    }

    // If song is exclusive and user is not VIP, deny access
    if (song.exclusive === 1 && !isVip) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập bài hát này. Vui lòng nâng cấp tài khoản VIP.' });
    }

    // Get all songs by the same artist
    const artistSongs = await Song.findAll({
      where: { artist_id: song.artist_id },
      attributes: ['id', 'title', 'image_url', 'audio_url', 'listen_count', 'exclusive'],
      include: [
        { model: Artist, as: 'artist', attributes: ['name'] },
      ],
      order: [['listen_count', 'DESC']],
    });

    const formattedArtistSongs = artistSongs.map(s => ({
      id: s.id,
      title: s.title,
      artist_name: s.artist ? s.artist.name : 'Unknown artist',
      image_url: s.image_url,
      audio_url: s.audio_url,
      listen_count: s.listen_count,
      exclusive: s.exclusive,
    }));

    const formattedSong = {
      id: song.id,
      title: song.title,
      lyrics: song.lyrics,
      audio_url: song.audio_url,
      image_url: song.image_url,
      release_date: song.release_date,
      listen_count: song.listen_count,
      exclusive: song.exclusive,
      artist: {
        id: song.artist.id,
        name: song.artist.name,
        image_url: song.artist.image_url,
        total_listens: song.artist.total_listens,
      },
      category_name: song.category ? song.category.name : 'Unknown category',
      artist_songs: formattedArtistSongs,
    };

    res.json(formattedSong);
  } catch (error) {
    console.error('Error fetching song detail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSongsBySearch = async (req, res) => {
  try {
    const { q, artist, page, limit } = req.query;

    let queryLimit = parseInt(limit) || 20;
    let offset = 0;

    if (page) {
      offset = (parseInt(page) - 1) * queryLimit;
    }

    // Build where clause for song title
    let where = {};
    if (q) {
      where = {
        ...where,
        [Op.and]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), { [Op.like]: `%${q.toLowerCase()}%` }),
      };
    }

    // Build include for artist
    const include = [
      {
        model: Artist,
        as: 'artist',
        attributes: ['name'],
        where: artist ? Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), { [Op.like]: `%${artist.toLowerCase()}%` }) : undefined,
        required: artist ? true : false,
      },
      {
        model: Category,
        as: 'category',
        attributes: ['name'],
      },
    ];

    const songs = await Song.findAll({
      where,
      include,
      attributes: ['id', 'title', 'audio_url', 'image_url', 'listen_count', 'release_date', 'exclusive'],
      limit: queryLimit,
      offset,
    });

    const formattedSongs = songs.map(song => ({
      id: song.id,
      title: song.title,
      artist_name: song.artist ? song.artist.name : 'Unknown artist',
      audio_url: song.audio_url,
      image_url: song.image_url,
      listen_count: song.listen_count,
      release_date: song.release_date,
      exclusive: song.exclusive,
    }));

    res.json(formattedSongs);
  } catch (error) {
    console.error('Error fetching songs by search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
