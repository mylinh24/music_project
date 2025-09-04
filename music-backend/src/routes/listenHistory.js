import express from 'express';
import listenHistory from '../models/listen_history.js';
import song from '../models/song.js';
import artist from '../models/artist.js';
import category from '../models/category.js';
import { Sequelize } from 'sequelize';

const router = express.Router();

// Get recently played songs for a specific user
router.get('/listen-history', async (req, res) => {
    try {
        const { user_id, limit } = req.query;
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const queryLimit = parseInt(limit) || 100;

        const history = await listenHistory.findAll({
            where: { user_id },
            include: [
                {
                    model: song,
                    as: 'song',
                    attributes: ['id', 'title', 'audio_url', 'image_url'],
                    include: [
                        { model: artist, as: 'artist', attributes: ['name'] },
                        { model: category, as: 'category', attributes: ['name'] },
                    ],
                },
            ],
            order: [['listened_at', 'DESC']], // mới nhất trước
            limit: queryLimit,
        });

        const formattedHistory = history.map(entry => ({
            id: entry.song.id,
            title: entry.song.title,
            artist_name: entry.song.artist ? entry.song.artist.name : 'Unknown artist',
            category_name: entry.song.category ? entry.song.category.name : 'Unknown category',
            audio_url: entry.song.audio_url,
            image_url: entry.song.image_url,
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
        console.error('Error fetching listen history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get trending songs (based on listen count in the last 7 days)
router.get('/trending-songs', async (req, res) => {
    try {
        const { limit } = req.query;
        const queryLimit = parseInt(limit) || 100;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trending = await listenHistory.findAll({
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
            limit: 10,
            include: [
                {
                    model: song,
                    as: 'song',
                    attributes: ['id', 'title', 'audio_url', 'image_url'],
                    include: [
                        { model: artist, as: 'artist', attributes: ['name'] },
                        { model: category, as: 'category', attributes: ['name'] },
                    ],
                },
            ],
        });

        const formattedTrending = trending.map(entry => ({
            id: entry.song.id,
            title: entry.song.title,
            artist_name: entry.song.artist ? entry.song.artist.name : 'Unknown artist',
            category_name: entry.song.category ? entry.song.category.name : 'Unknown category',
            audio_url: entry.song.audio_url,
            image_url: entry.song.image_url,
            listen_count: parseInt(entry.getDataValue('listen_count')),
        }));

        res.json(formattedTrending);
    } catch (error) {
        console.error('Error fetching trending songs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/artists', async (req, res) => {
    try {
        const { limit } = req.query;
        const queryLimit = parseInt(limit) || 100;

        const artists = await artist.findAll({
            attributes: ['id', 'name', 'image_url', 'total_listens'],
            order: [['total_listens', 'DESC']],
            limit: queryLimit,
        });

        const formattedArtists = artists.map(artist => ({
            id: artist.id,
            name: artist.name,
            image_url: artist.image_url || null,
            total_listens: artist.total_listens || 0,
        }));

        res.json(formattedArtists);
    } catch (error) {
        console.error('Error fetching artists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;