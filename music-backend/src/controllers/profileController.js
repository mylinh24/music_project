import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const getProfile = async (req, res) => {
  try {
    // Lấy token từ header Authorization
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token. Vui lòng đăng nhập.' });
    }

    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Tìm người dùng trong cơ sở dữ liệu
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'isVerified'],
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Trả về thông tin người dùng
    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin hồ sơ:', error.message, error.stack);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
    res.status(500).json({ message: 'Lỗi khi lấy thông tin hồ sơ', error: error.message });
  }
};

export { getProfile };