import bcrypt from 'bcryptjs';
import { User, OTP } from '../models/index.js';

const salt = bcrypt.genSaltSync(10);

const resetPassword = async (req, res) => {
    const { userId, otp, newPassword } = req.body;
    try {
        // Tìm OTP mới nhất cho user, sắp xếp theo thời gian tạo (id giảm dần)
        const otpRecord = await OTP.findOne({
            where: { userId, type: 'forgot' },
            order: [['id', 'DESC']] // Lấy OTP mới nhất
        });

        if (!otpRecord) return res.status(400).json({ message: 'OTP không tồn tại' });
        if (otpRecord.expiresAt < new Date()) return res.status(400).json({ message: 'OTP đã hết hạn' });

        const isValid = bcrypt.compareSync(otp, otpRecord.otp);
        if (!isValid) return res.status(400).json({ message: 'OTP không hợp lệ' });

        const hashPassword = bcrypt.hashSync(newPassword, salt);
        const user = await User.findByPk(userId);
        user.password = hashPassword;
        await user.save();

        // Xóa tất cả OTP của user này sau khi reset thành công
        await OTP.destroy({ where: { userId, type: 'forgot' } });

        res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đặt lại mật khẩu', error: error.message });
    }
};

export { resetPassword };