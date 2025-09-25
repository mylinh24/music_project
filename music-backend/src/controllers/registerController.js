import bcrypt from 'bcryptjs';
import { User, OTP } from '../models/index.js';
import { sendOTP } from '../services/emailService.js';

const salt = bcrypt.genSaltSync(10);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const register = async (req, res) => {
    const { email, password, firstName, lastName, referralCode } = req.body;
    try {
        console.log('Request body:', req.body);
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ email, password, firstName, lastName' });
        }

        let referredByUser = null;
        let referredById = null;

        // Xử lý referral code nếu có
        if (referralCode) {
            referredByUser = await User.findOne({
                where: { referral_code: referralCode }
            });

            if (referredByUser) {
                referredById = referredByUser.id;

                // Kiểm tra không được tự giới thiệu chính mình
                if (referredById === req.userId) {
                    return res.status(400).json({
                        message: 'Không thể sử dụng mã giới thiệu của chính mình'
                    });
                }
            }
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: 'Email đã được sử dụng và xác thực' });
        }

        let user;
        if (existingUser && !existingUser.isVerified) {
            // Cập nhật thông tin user chưa xác thực
            const hashPassword = bcrypt.hashSync(password, salt);
            await existingUser.update({
                password: hashPassword,
                firstName,
                lastName,
            });
            user = existingUser;
        } else {
            // Tạo user mới
            const hashPassword = bcrypt.hashSync(password, salt);
            user = await User.create({
                email,
                password: hashPassword,
                firstName,
                lastName,
                isVerified: false,
                referred_by: referredById, // Lưu ID người giới thiệu
            });
        }
        console.log('User created/updated:', user.id);

        // Xóa OTP cũ (nếu có)
        await OTP.destroy({ where: { userId: user.id, type: 'register' } });

        // Tạo và gửi OTP mới
        const otp = generateOTP();
        console.log('Generated OTP:', otp);
        await sendOTP(email, otp, 'register');
        console.log('OTP sent to:', email);

        await OTP.create({
            userId: user.id,
            otp: bcrypt.hashSync(otp, salt),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            type: 'register',
        });
        console.log('OTP saved to database');

        res.status(201).json({ message: 'User registered. Check email for OTP.', userId: user.id });
    } catch (error) {
        console.error('Lỗi đăng ký:', error.message, error.stack);
        res.status(500).json({ message: 'Error in registration', error: error.message });
    }
};

export { register };