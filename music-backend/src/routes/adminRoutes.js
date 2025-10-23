import express from 'express';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllSongs,
  updateSong,
  deleteSong,
  createSong,
  getSongById,
  createArtist,
  getArtistById,
  getAllArtists,
  getAllCategories,
  updateArtist,
  deleteArtist,
  getDashboardStats,
  getRevenueStats,
  getVipPurchasesList,
  getNewCustomers,
  getTopVipPackages,
  getContributionPointsStats,
  getMonthlyRevenueStats,
  getAllComments,
  deleteComment,
  updateCommentStatus,
  getAllVipPackages,
  createVipPackage,
  updateVipPackage,
  deleteVipPackage
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// User management routes
router.get('/users', requireAdmin, getAllUsers);
router.put('/users/:id/role', requireAdmin, updateUserRole);
router.delete('/users/:id', requireAdmin, deleteUser);

// Song management routes
router.post('/songs', requireAdmin, createSong);
router.get('/songs', requireAdmin, getAllSongs);
router.get('/songs/:id', requireAdmin, getSongById);
router.put('/songs/:id', requireAdmin, updateSong);
router.delete('/songs/:id', requireAdmin, deleteSong);

// Artist management routes
router.post('/artists', requireAdmin, createArtist);
router.get('/artists', requireAdmin, getAllArtists);
router.get('/artists/:id', requireAdmin, getArtistById);
router.put('/artists/:id', requireAdmin, updateArtist);
router.delete('/artists/:id', requireAdmin, deleteArtist);

// Categories
router.get('/categories', requireAdmin, getAllCategories);

// Dashboard stats
router.get('/stats', requireAdmin, getDashboardStats);

// Statistics routes
router.get('/stats/revenue', requireAdmin, getRevenueStats);
router.get('/stats/monthly-revenue', requireAdmin, getMonthlyRevenueStats);
router.get('/stats/vip-purchases', requireAdmin, getVipPurchasesList);
router.get('/stats/new-customers', requireAdmin, getNewCustomers);
router.get('/stats/top-packages', requireAdmin, getTopVipPackages);
router.get('/stats/contribution-points', requireAdmin, getContributionPointsStats);

// Comment management routes
router.get('/comments', requireAdmin, getAllComments);
router.delete('/comments/:id', requireAdmin, deleteComment);
router.put('/comments/:id/status', requireAdmin, updateCommentStatus);

// VIP Package management routes
router.post('/vip-packages', requireAdmin, createVipPackage);
router.put('/vip-packages/:id', requireAdmin, updateVipPackage);
router.delete('/vip-packages/:id', requireAdmin, deleteVipPackage);
router.get('/vip-packages', requireAdmin, getAllVipPackages);

export default router;
