import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/configdb.js';
import authRoutes from './routes/auth.js';
import songRoutes from './routes/song.js';
import listenHistoryRoutes from './routes/listenHistory.js';
import favoritesRouter from './routes/favorites.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/listen-history', listenHistoryRoutes);
app.use('/api/favorites', favoritesRouter);

// Fallback for /api/trending-songs and /api/artists
app.use('/api', listenHistoryRoutes);

connectDB();

const port = process.env.PORT || 6969;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});