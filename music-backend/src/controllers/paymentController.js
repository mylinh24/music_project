import PaymentService from '../services/paymentService.js'; // Chuyển sang import ES Modules
import { VipPackage } from '../models/index.js';

const getUserPoints = async (req, res) => {
  try {
    console.log('Getting user points for userId:', req.userId);
    const userId = req.userId;
    const points = await PaymentService.getUserPoints(userId);
    console.log('User points:', points);
    res.json({ points });
  } catch (err) {
    console.error('Error getting user points:', err);
    res.status(500).json({ error: err.message });
  }
};

const testGetUserPoints = async (req, res) => {
  try {
    console.log('Testing user points endpoint');
    // Try to get the first user from database for testing
    const { User } = await import('../models/index.js');
    const user = await User.findOne();
    if (!user) {
      console.log('No users found in database');
      return res.json({ points: 0, message: 'No users found, using default 0 points' });
    }
    const points = user.contribution_points || 0;
    console.log('Test user points:', points);
    res.json({ points, userId: user.id, message: 'Test endpoint working' });
  } catch (err) {
    console.error('Error in test endpoint:', err);
    res.status(500).json({ error: err.message, message: 'Database connection issue' });
  }
};

const getVipPackages = async (req, res) => {
  try {
    console.log('Getting VIP packages');
    const packages = await VipPackage.findAll();
    console.log('VIP packages:', packages);
    res.json({ packages });
  } catch (err) {
    console.error('Error getting VIP packages:', err);
    res.status(500).json({ error: err.message });
  }
};

const createSession = async (req, res) => {
  try {
    console.log('Creating payment session for userId:', req.userId);
    console.log('Request body:', req.body);
    const userId = req.userId; // Sử dụng req.userId từ authenticateToken
    const { packageId, usePoints, pointsToConvert } = req.body;
    const { sessionId, userId: returnedUserId, qrData } = await PaymentService.createPaymentSession(userId, packageId, { usePoints, pointsToConvert });
    console.log('Payment session created:', { sessionId, userId: returnedUserId, qrData });
    res.json({ sessionId, userId: returnedUserId, qrData });
  } catch (err) {
    console.error('Error creating payment session:', err);
    res.status(500).json({ error: err.message });
  }
};

const simulateSuccess = async (req, res) => {
  try {
    const { sessionId, userId, packageId, pointsUsed } = req.query; // Lấy từ URL QR
    if (!sessionId || !userId || !packageId) throw new Error('Missing sessionId, userId, or packageId');

    const user = await PaymentService.completePayment(userId, sessionId, packageId, parseInt(pointsUsed) || 0);

    res.send(`
      <html>
        <head>
          <title>Thanh toán thành công</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              color: white;
            }
            .success-container {
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              text-align: center;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .success-icon {
              font-size: 60px;
              margin-bottom: 20px;
            }
            .success-title {
              font-size: 24px;
              margin-bottom: 10px;
            }
            .success-message {
              font-size: 16px;
              margin-bottom: 20px;
            }
            .redirect-message {
              font-size: 14px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="success-container">
            <div class="success-icon">✅</div>
            <h1 class="success-title">Thanh toán thành công!</h1>
            <p class="success-message">Tài khoản của bạn đã được nâng cấp lên VIP.</p>
            <p class="redirect-message">Đang chuyển hướng về trang chủ...</p>
          </div>
          <script>
            setTimeout(() => {
              window.location.href = 'http://localhost:3000/home-page';
            }, 3000);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Payment completion error:', err);
    res.status(400).send(`
      <html>
        <head>
          <title>Lỗi thanh toán</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              color: white;
            }
            .error-container {
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              text-align: center;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .error-icon {
              font-size: 60px;
              margin-bottom: 20px;
            }
            .error-title {
              font-size: 24px;
              margin-bottom: 10px;
            }
            .error-message {
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <div class="error-icon">❌</div>
            <h1 class="error-title">Thanh toán thất bại</h1>
            <p class="error-message">Lỗi: ${err.message}</p>
          </div>
        </body>
      </html>
    `);
  }
};

const updateExpiredVips = async (req, res) => {
  try {
    console.log('Manually updating expired VIPs');
    const { User, VipPurchase } = await import('../models/index.js');
    
    // Update users whose VIP has expired
    const [affectedRows] = await User.sequelize.query(`
      UPDATE users u
      INNER JOIN (
          SELECT user_id, MAX(expiry_date) as latest_expiry
          FROM vip_purchases 
          WHERE expiry_date < NOW()
          GROUP BY user_id
      ) expired_vips ON u.id = expired_vips.user_id
      SET u.vip = 0
      WHERE u.vip = 1
      AND NOT EXISTS (
          SELECT 1 FROM vip_purchases active_vip
          WHERE active_vip.user_id = u.id
          AND active_vip.expiry_date > NOW()
      )
    `);
    
    console.log(`Updated ${affectedRows} users' VIP status to expired.`);
    res.json({ message: `Updated ${affectedRows} users' VIP status to expired.` });
  } catch (err) {
    console.error('Error updating expired VIPs:', err);
    res.status(500).json({ error: err.message });
  }
};

export default { getUserPoints, testGetUserPoints, getVipPackages, createSession, simulateSuccess, updateExpiredVips }; // Export default một object chứa các method
