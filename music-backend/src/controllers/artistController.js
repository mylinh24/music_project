// music-backend/src/controllers/artistController.js
import { Sequelize } from 'sequelize';
import Artist from '../models/artist.js';
import Song from '../models/song.js';

export const getArtistDetail = async (req, res) => {
  try {
    const artistId = req.params.artistId;
    if (!artistId) {
      return res.status(400).json({ error: 'artistId là bắt buộc.' });
    }

    const artist = await Artist.findByPk(artistId, {
      attributes: ['id', 'name', 'image_url', 'total_listens'],
    });

    if (!artist) {
      return res.status(404).json({ error: 'Không tìm thấy nghệ sĩ.' });
    }

    const songs = await Song.findAll({
      where: { artist_id: artistId },
      attributes: ['id', 'title', 'image_url', 'audio_url', 'release_date', 'listen_count'],
      include: [
        { model: Artist, as: 'artist', attributes: ['name'] },
      ],
    });

    const formattedSongs = songs.map(song => ({
      id: song.id,
      title: song.title,
      image_url: song.image_url || null,
      audio_url: song.audio_url || null,
      release_date: song.release_date,
      listen_count: song.listen_count,
      artist_name: song.artist.name,
    }));

    res.json({
      artist: {
        id: artist.id,
        name: artist.name,
        image_url: artist.image_url || null,
        total_listens: artist.total_listens,
      },
      songs: formattedSongs,
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết nghệ sĩ:', error);
    res.status(500).json({ error: 'Không thể tải chi tiết nghệ sĩ.' });
  }
};