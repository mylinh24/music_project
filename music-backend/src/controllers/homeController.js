import { Sequelize } from 'sequelize';
import Song from '../models/song.js';
import Artist from '../models/artist.js';
import Category from '../models/category.js';
import ListenHistory from '../models/listen_history.js';
import User from '../models/user.js'; // Import User model

export const getLatestSongs = async (req, res) => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const songs = await Song.findAll({
      where: {
        release_date: {
          [Sequelize.Op.gte]: twoWeeksAgo,
        },
      },
      order: [['release_date', 'DESC']],
      attributes: ['id', 'title', 'audio_url', 'image_url', 'release_date', 'listen_count', 'exclusive'],
      include: [
        { model: Artist, as: 'artist', attributes: ['name'] },
        { model: Category, as: 'category', attributes: ['name'] },
      ],
    });

    const formattedSongs = songs.map(song => ({
      id: song.id,
      title: song.title,
      artist_name: song.artist ? song.artist.name : 'Unknown artist',
      category_name: song.category ? song.category.name : 'Unknown category',
      audio_url: song.audio_url,
      image_url: song.image_url,
      release_date: song.release_date,
      listen_count: song.listen_count,
      exclusive: song.exclusive,
    }));

    res.json(formattedSongs);
  } catch (error) {
    console.error('Lỗi khi lấy bài hát mới nhất:', error);
    res.status(500).json({ error: 'Không thể tải danh sách bài hát mới nhất.' });
  }
};

export const getPopularSongs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const songs = await Song.findAll({
      order: [['listen_count', 'DESC']],
      limit: limit,
      attributes: ['id', 'title', 'audio_url', 'image_url', 'release_date', 'listen_count', 'exclusive'],
      include: [
        { model: Artist, as: 'artist', attributes: ['name'] },
        { model: Category, as: 'category', attributes: ['name'] },
      ],
    });

    const formattedSongs = songs.map(song => ({
      id: song.id,
      title: song.title,
      artist_name: song.artist ? song.artist.name : 'Unknown artist',
      category_name: song.category ? song.category.name : 'Unknown category',
      audio_url: song.audio_url,
      image_url: song.image_url,
      release_date: song.release_date,
      listen_count: song.listen_count,
      exclusive: song.exclusive,
    }));

    res.json(formattedSongs);
  } catch (error) {
    console.error('Lỗi khi lấy bài hát phổ biến:', error);
    res.status(500).json({ error: 'Không thể tải danh sách bài hát phổ biến.' });
  }
};

export const getTrendingSongs = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Lấy danh sách song_id và listen_count từ ListenHistory
    const trending = await ListenHistory.findAll({
      attributes: [
        'song_id',
        [Sequelize.fn('COUNT', Sequelize.col('song_id')), 'listen_count'],
      ],
      where: {
        listened_at: {
          [Sequelize.Op.gte]: sevenDaysAgo,
        },
      },
      group: ['song_id'],
      order: [[Sequelize.literal('listen_count'), 'DESC']],
    });

    const songIds = trending.map(entry => entry.song_id);

    // Lấy chi tiết bài hát từ Song theo danh sách song_id
    const songs = await Song.findAll({
      where: { id: songIds },
      attributes: ['id', 'title', 'audio_url', 'image_url', 'release_date', 'listen_count', 'exclusive'],
      include: [
        { model: Artist, as: 'artist', attributes: ['name'] },
        { model: Category, as: 'category', attributes: ['name'] },
      ],
    });

    const songMap = new Map(songs.map(song => [song.id, song]));

    // Ghép dữ liệu listen_count với chi tiết bài hát
    const formattedTrending = trending.map(entry => {
      const song = songMap.get(entry.song_id);
      return {
        id: song.id,
        title: song.title,
        artist_name: song.artist ? song.artist.name : 'Unknown artist',
        category_name: song.category ? song.category.name : 'Unknown category',
        audio_url: song.audio_url,
        image_url: song.image_url,
        release_date: song.release_date,
        listen_count: parseInt(entry.getDataValue('listen_count')),
        exclusive: song.exclusive !== undefined ? song.exclusive : false,
      };
    });

    res.json(formattedTrending);
  } catch (error) {
    console.error('Lỗi khi lấy bài hát xu hướng:', error);
    res.status(500).json({ error: 'Không thể tải danh sách bài hát xu hướng.' });
  }
};

export const getRecentlyPlayed = async (req, res) => {
  try {
    const userId = req.query.user_id;
    const limit = parseInt(req.query.limit) || 8;
    if (!userId) {
      return res.status(400).json({ error: 'user_id là bắt buộc.' });
    }

    const history = await ListenHistory.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Song,
          as: 'song',
          attributes: ['id', 'title', 'audio_url', 'image_url', 'exclusive'],
          include: [
            { model: Artist, as: 'artist', attributes: ['name'] },
            { model: Category, as: 'category', attributes: ['name'] },
          ],
        },
      ],
      order: [['listened_at', 'DESC']],
      limit: limit,
    });

    const formattedHistory = history.map(entry => ({
      id: entry.song.id,
      title: entry.song.title,
      artist_name: entry.song.artist ? entry.song.artist.name : 'Unknown artist',
      category_name: entry.song.category ? entry.song.category.name : 'Unknown category',
      audio_url: entry.song.audio_url,
      image_url: entry.song.image_url,
      exclusive: entry.song.exclusive,
    }));

    // Lọc trùng theo song.id → chỉ giữ lần nghe mới nhất
    const uniqueSongs = [];
    const seen = new Set();
    for (const song of formattedHistory) {
      if (!seen.has(song.id)) {
        seen.add(song.id);
        uniqueSongs.push(song);
      }
    }

    res.json(uniqueSongs);
  } catch (error) {
    console.error('Lỗi khi lấy bài hát nghe gần đây:', error);
    res.status(500).json({ error: 'Không thể tải danh sách bài hát nghe gần đây.' });
  }
};

export const getTopArtists = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const artists = await Artist.findAll({
      order: [['total_listens', 'DESC']],
      limit: limit,
      attributes: ['id', 'name', 'image_url', 'total_listens'],
    });

    const formattedArtists = artists.map(artist => ({
      id: artist.id,
      name: artist.name,
      image_url: artist.image_url || null,
      total_listens: artist.total_listens || 0,
    }));

    res.json(formattedArtists);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nghệ sĩ:', error);
    res.status(500).json({ error: 'Không thể tải danh sách nghệ sĩ.' });
  }
};

// Endpoint để lấy họ tên người dùng cho HomePage
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.query.user_id; // Giả định user_id từ query hoặc middleware xác thực
    if (!userId) {
      return res.status(400).json({ error: 'user_id là bắt buộc.' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['firstName', 'lastName'],
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    }

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Người dùng';
    res.json({ fullName });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ error: 'Không thể tải thông tin người dùng.' });
  }
};