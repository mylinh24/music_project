import { User } from '../models/index.js';

export const generateReferralCode = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    // Tạo referral code nếu chưa có
    if (!user.referral_code) {
      let referralCode;
      let isUnique = false;

      // Tạo code unique
      while (!isUnique) {
        referralCode = `REF${userId}${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

        // Kiểm tra code đã tồn tại chưa
        const existingUser = await User.findOne({ where: { referral_code: referralCode } });
        if (!existingUser) {
          isUnique = true;
        }
      }

      await user.update({ referral_code: referralCode });
    }

    // Tạo referral link
    const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${user.referral_code}`;

    res.json({
      referral_code: user.referral_code,
      referral_link: referralLink,
      referral_count: user.referral_count || 0
    });

  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({ error: 'Lỗi server nội bộ' });
  }
};

export const getReferralStats = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    // Tạo referral code nếu chưa có
    if (!user.referral_code) {
      let referralCode;
      let isUnique = false;

      // Tạo code unique
      while (!isUnique) {
        referralCode = `REF${userId}${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

        // Kiểm tra code đã tồn tại chưa
        const existingUser = await User.findOne({ where: { referral_code: referralCode } });
        if (!existingUser) {
          isUnique = true;
        }
      }

      await user.update({ referral_code: referralCode });
    }

    // Lấy thông tin user sau khi cập nhật
    const updatedUser = await User.findByPk(userId, {
      attributes: ['referral_code', 'referral_count', 'contribution_points']
    });

    // Lấy danh sách user được giới thiệu
    const referredUsers = await User.findAll({
      where: {
        referred_by: userId,
        isVerified: true
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    // Tạo referral link
    const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${updatedUser.referral_code}`;

    res.json({
      referral_code: updatedUser.referral_code,
      referral_link: referralLink,
      referral_count: updatedUser.referral_count || 0,
      total_points: updatedUser.contribution_points || 0,
      referred_users: referredUsers
    });

  } catch (error) {
    console.error('Error getting referral stats:', error);
    res.status(500).json({ error: 'Lỗi server nội bộ' });
  }
};