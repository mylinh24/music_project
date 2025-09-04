import express from 'express';
import { addFavorite, removeFavorite, getFavorites } from '../controllers/favorites.js';

const router = express.Router();

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/', removeFavorite);

export default router;