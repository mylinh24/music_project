import bcrypt from 'bcryptjs';
import { User, OTP } from '../models/index.js';
import { sendOTP, sendAdminNotification } from '../services/emailService.js';
import { broadcastToAdmins } from '../websocket.js';

const salt = bcrypt.genSaltSync(10);
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const otpRecord = await OTP.findOne({ where: { userId, type: 'register' } });
    if (!otpRecord || otpRecord.expiresAt < new Date()) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const isValid = bcrypt.compareSync(otp, otpRecord.otp);
    if (!isValid) return res.status(400).json({ message: 'Invalid OTP' });

    const user = await User.findByPk(userId);
    user.isVerified = true;
    await user.save();
    await otpRecord.destroy();



    // Tích điểm cho người giới thiệu nếu có
    if (user.referred_by) {
      const referrer = await User.findByPk(user.referred_by);
      if (referrer) {
        // Cập nhật trực tiếp contribution_points và referral_count
        const currentPoints = referrer.contribution_points || 0;
        const currentCount = referrer.referral_count || 0;
        await referrer.update({
          contribution_points: currentPoints + 50,
          referral_count: currentCount + 1
        });
      }
    }

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error in OTP verification', error: error.message });
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;
  console.log('Resend OTP request received:', { email });
  try {
    if (!email) {
      console.log('Missing email in request');
      return res.status(400).json({ message: 'Vui lòng cung cấp email' });
    }

    // Kiểm tra xem email có tồn tại và chưa được xác thực
    const user = await User.findOne({ where: { email, isVerified: false } });
    if (!user) {
      console.log('User not found or already verified:', { email });
      return res.status(400).json({ message: 'Email không tồn tại hoặc đã được xác thực' });
    }

    // Xóa OTP cũ (nếu có)
    await OTP.destroy({ where: { userId: user.id, type: 'register' } });
    console.log('Old OTPs deleted for user:', user.id);

    // Tạo OTP mới
    const otp = generateOTP();
    console.log('Generated new OTP:', otp);
    await sendOTP(email, otp, 'register');
    console.log('OTP sent to:', email);

    // Lưu OTP mới vào database
    await OTP.create({
      userId: user.id,
      otp: bcrypt.hashSync(otp, salt),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      type: 'register',
    });
    console.log('New OTP saved to database');

    res.status(200).json({ message: 'OTP đã được gửi lại. Vui lòng kiểm tra email.', userId: user.id });
  } catch (error) {
    console.error('Lỗi gửi lại OTP:', error.message, error.stack);
    res.status(500).json({ message: 'Lỗi khi gửi lại OTP', error: error.message });
  }
};

export { verifyOTP, resendOTP };