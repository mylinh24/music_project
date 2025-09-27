// music-backend/src/server.js
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/configdb.js';
import './models/index.js'; // Import models to ensure they are loaded
import { initWebSocket } from './websocket.js';
import authRoutes from './routes/auth.js';
import songRoutes from './routes/song.js';
import listenHistoryRoutes from './routes/listenHistory.js';
import homeRoutes from './routes/homeRoutes.js'; // Thêm dòng này
import profileRoutes from './routes/profileRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import favoritesRouter from './routes/favorites.js';
import paymentRoutes from './routes/payment.js';
import commentRoutes from './routes/comment.js';
import referralRoutes from './routes/referral.js';
import adminRoutes from './routes/adminRoutes.js';
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for avatar uploads
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api', songRoutes);
app.use('/api', listenHistoryRoutes);
app.use('/api', homeRoutes); // Thêm dòng này để kích hoạt homeRoutes
app.use('/api', profileRoutes);
app.use('/api', artistRoutes);
app.use('/api/favorites', favoritesRouter);
app.use('/api/payment', paymentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/admin', adminRoutes);

connectDB();

// Initialize WebSocket
initWebSocket(server);

const port = process.env.PORT || 6969;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
