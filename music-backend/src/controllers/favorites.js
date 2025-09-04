import { Favorite, User, Song } from '../models/index.js';

export const getFavorites = async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const favorites = await Favorite.findAll({
            where: { user_id },
            include: [
                { model: Song, as: 'song', attributes: ['id', 'title', 'artist_id', 'image_url', 'audio_url'] },
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
        const { user_id, song_id } = req.body;
        if (!user_id || !song_id) {
            return res.status(400).json({ error: 'user_id and song_id are required' });
        }

        // Check if user and song exist
        const user = await User.findByPk(user_id);
        const song = await Song.findByPk(song_id);
        if (!user || !song) {
            return res.status(404).json({ error: 'User or song not found' });
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
        const { user_id, song_id } = req.body;
        if (!user_id || !song_id) {
            return res.status(400).json({ error: 'user_id and song_id are required' });
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