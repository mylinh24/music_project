import express from 'express';
import song from '../models/song.js';
import artist from '../models/artist.js';
import category from '../models/category.js';
import { getSongDetail, getSongsByCategory } from '../controllers/songController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get songs with optional sorting, limit, and pagination
router.get('/songs', optionalAuthenticateToken, async (req, res) => {
    try {
        const { sort, limit, page } = req.query;
        let order = [];
        let queryLimit = parseInt(limit) || 20; // Default smaller limit for lazy loading
        let offset = 0;

        if (page) {
            offset = (parseInt(page) - 1) * queryLimit;
        }

        if (sort === 'release_date') {
            order = [['release_date', 'DESC']];
        } else if (sort === 'listen_count') {
            order = [['listen_count', 'DESC']];
        }

        const songs = await song.findAll({
            attributes: ['id', 'title', 'audio_url', 'image_url', 'listen_count', 'release_date', 'exclusive'],
            include: [
                { model: artist, as: 'artist', attributes: ['name'] },
                { model: category, as: 'category', attributes: ['name'] },
            ],
            order,
            limit: queryLimit,
            offset,
        });



        // Map data to match frontend expectations
        const formattedSongs = songs.map(song => ({
            id: song.id,
            title: song.title,
            artist_name: song.artist ? song.artist.name : 'Unknown artist',
            category_name: song.category ? song.category.name : 'Unknown category',
            audio_url: song.audio_url,
            image_url: song.image_url,
            listen_count: song.listen_count,
            release_date: song.release_date,
            exclusive: song.exclusive,
        }));

        res.json(formattedSongs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get songs by category
router.get('/songs/category/:category', optionalAuthenticateToken, getSongsByCategory);

// Get song detail by ID
router.get('/song/:id', authenticateToken, getSongDetail);

export default router;
