import bcrypt from 'bcryptjs';
import { User, OTP } from '../models/index.js';
import { sendOTP } from '../services/emailService.js';

const salt = bcrypt.genSaltSync(10);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Email not found' });

        // Xóa các OTP cũ của user này trước khi tạo OTP mới
        await OTP.destroy({ where: { userId: user.id, type: 'forgot' } });

        const otp = generateOTP();
        await sendOTP(email, otp, 'forgot');
        await OTP.create({
            userId: user.id,
            otp: bcrypt.hashSync(otp, salt),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            type: 'forgot',
        });

        res.status(200).json({ message: 'OTP sent to email', userId: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Error in forgot password', error: error.message });
    }
};

export { forgotPassword };