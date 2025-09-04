// music-backend/src/controllers/profileController.js
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

export const getProfile = async (req, res) => {
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
      attributes: ['id', 'email', 'firstName', 'lastName', 'isVerified', 'avatar'],
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Trả về thông tin người dùng bao gồm avatar
    let avatarData = null;
    if (user.avatar) {
      // Detect mime type from buffer
      const buffer = user.avatar;
      let mime = 'image/jpeg'; // default
      if (buffer.length > 4) {
        if (buffer[0] === 0xFF && buffer[1] === 0xD8) mime = 'image/jpeg';
        else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) mime = 'image/png';
        else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) mime = 'image/gif';
      }
      avatarData = `data:${mime};base64,${user.avatar.toString('base64')}`;
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
      avatar: avatarData,
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin hồ sơ:', error.message, error.stack);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
    res.status(500).json({ message: 'Lỗi khi lấy thông tin hồ sơ', error: error.message });
  }
};


// Endpoint để cập nhật avatar
export const updateAvatar = async (req, res) => {
  try {
    // Lấy token từ header Authorization
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token. Vui lòng đăng nhập.' });
    }

    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { avatar } = req.body; // Avatar as base64 string
    if (!avatar) {
      return res.status(400).json({ error: 'Avatar là bắt buộc.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    }

    // Chuyển base64 thành buffer để lưu vào database
    const avatarBuffer = Buffer.from(avatar, 'base64');
    await user.update({ avatar: avatarBuffer });

    res.json({ message: 'Cập nhật avatar thành công.', avatar: avatarBuffer.toString('base64') });
  } catch (error) {
    console.error('Lỗi khi cập nhật avatar:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
    res.status(500).json({ error: 'Không thể cập nhật avatar.' });
  }
};

// Endpoint để cập nhật thông tin profile (họ tên, email, avatar)
export const updateProfile = async (req, res) => {
  try {
    // Lấy token từ header Authorization
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token. Vui lòng đăng nhập.' });
    }

    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { email, firstName, lastName, avatar } = req.body;
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'email, firstName, và lastName là bắt buộc.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    }

    const updateData = { email, firstName, lastName };
    if (avatar) {
      // Chuyển base64 thành buffer để lưu avatar
      const avatarBuffer = Buffer.from(avatar, 'base64');
      updateData.avatar = avatarBuffer;
    }

    await user.update(updateData);

    // Trả về thông tin người dùng đầy đủ
    let avatarData = null;
    if (user.avatar) {
      // Detect mime type from buffer
      const buffer = user.avatar;
      let mime = 'image/jpeg'; // default
      if (buffer.length > 4) {
        if (buffer[0] === 0xFF && buffer[1] === 0xD8) mime = 'image/jpeg';
        else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) mime = 'image/png';
        else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) mime = 'image/gif';
      }
      avatarData = `data:${mime};base64,${user.avatar.toString('base64')}`;
    }

    res.json({
      message: 'Cập nhật thông tin thành công.',
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
      avatar: avatarData,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
    res.status(500).json({ error: 'Không thể cập nhật thông tin.' });
  }
};
