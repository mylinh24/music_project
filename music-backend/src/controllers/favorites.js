import { Favorite, User, Song, Artist } from '../models/index.js';

export const getFavorites = async (req, res) => {
    try {
        const user_id = req.userId;

        const favorites = await Favorite.findAll({
            where: { user_id },
            include: [
                {
                    model: Song,
                    as: 'song',
                    attributes: ['id', 'title', 'artist_id', 'image_url', 'audio_url'],
                    include: [
                        { model: Artist, as: 'artist', attributes: ['name'] }
                    ]
                },
            ],
        });

        res.status(200).json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addFavorite = async (req, res) => {
    try {
        const user_id = req.userId;
        const { song_id } = req.body;
        if (!song_id) {
            return res.status(400).json({ error: 'song_id is required' });
        }

        // Check if song exists
        const song = await Song.findByPk(song_id);
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({ where: { user_id, song_id } });
        if (existingFavorite) {
            return res.status(400).json({ error: 'Song already in favorites' });
        }

        const favorite = await Favorite.create({ user_id, song_id });
        res.status(201).json(favorite);
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const removeFavorite = async (req, res) => {
    try {
        const user_id = req.userId;
        const { song_id } = req.body;
        if (!song_id) {
            return res.status(400).json({ error: 'song_id is required' });
        }

        const favorite = await Favorite.findOne({ where: { user_id, song_id } });
        if (!favorite) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        await favorite.destroy();
        res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
