import express from 'express';
import song from '../models/song.js';
import artist from '../models/artist.js';
import category from '../models/category.js';
import { getSongDetail } from '../controllers/songController.js';

const router = express.Router();

// Get songs with optional sorting and limit
router.get('/songs', async (req, res) => {
    try {
        const { sort, limit } = req.query;
        let order = [];
        let queryLimit = parseInt(limit) || 100;

        if (sort === 'release_date') {
            order = [['release_date', 'DESC']];
        } else if (sort === 'listen_count') {
            order = [['listen_count', 'DESC']];
        }

        const songs = await song.findAll({
            attributes: ['id', 'title', 'audio_url', 'image_url', 'listen_count', 'release_date'],
            include: [
                { model: artist, as: 'artist', attributes: ['name'] },
                { model: category, as: 'category', attributes: ['name'] },
            ],
            order,
            limit: queryLimit,
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
        }));

        res.json(formattedSongs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get song detail by ID
router.get('/song/:id', getSongDetail);

export default router;
