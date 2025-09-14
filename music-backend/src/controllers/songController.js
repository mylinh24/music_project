import Song from '../models/song.js';
import Artist from '../models/artist.js';
import Category from '../models/category.js';

export const getSongsByCategory = async (req, res) => {
  try {
    const categoryName = req.params.category;
    if (!categoryName) {
      return res.status(400).json({ error: 'Category name is required.' });
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
      attributes: ['id', 'title', 'audio_url', 'image_url', 'listen_count', 'release_date'],
    });

    const formattedSongs = songs.map(song => ({
      id: song.id,
      title: song.title,
      artist_name: song.artist ? song.artist.name : 'Unknown artist',
      audio_url: song.audio_url,
      image_url: song.image_url,
      listen_count: song.listen_count,
      release_date: song.release_date,
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

    const song = await Song.findByPk(songId, {
      attributes: ['id', 'title', 'lyrics', 'audio_url', 'image_url', 'release_date', 'listen_count', 'artist_id'],
      include: [
        { model: Artist, as: 'artist', attributes: ['id', 'name', 'image_url', 'total_listens'] },
        { model: Category, as: 'category', attributes: ['name'] },
      ],
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found.' });
    }

    // Get all songs by the same artist
    const artistSongs = await Song.findAll({
      where: { artist_id: song.artist_id },
      attributes: ['id', 'title', 'image_url', 'audio_url', 'listen_count'],
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
    }));

    const formattedSong = {
      id: song.id,
      title: song.title,
      lyrics: song.lyrics,
      audio_url: song.audio_url,
      image_url: song.image_url,
      release_date: song.release_date,
      listen_count: song.listen_count,
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
