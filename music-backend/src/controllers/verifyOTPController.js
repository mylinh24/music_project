import bcrypt from 'bcryptjs';
import { User, OTP } from '../models/index.js';

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

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error in OTP verification', error: error.message });
    }
};

export { verifyOTP };