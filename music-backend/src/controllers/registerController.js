import bcrypt from 'bcryptjs';
import { User, OTP } from '../models/index.js';
import { sendOTP } from '../services/emailService.js';

const salt = bcrypt.genSaltSync(10);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const register = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    try {
        console.log('Request body:', req.body);
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ email, password, firstName, lastName' });
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const hashPassword = bcrypt.hashSync(password, salt);
        const newUser = await User.create({
            email,
            password: hashPassword,
            firstName,
            lastName,
        });
        console.log('User created:', newUser.id);

        const otp = generateOTP();
        console.log('Generated OTP:', otp);
        await sendOTP(email, otp, 'register');
        console.log('OTP sent to:', email);

        await OTP.create({
            userId: newUser.id,
            otp: bcrypt.hashSync(otp, salt),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            type: 'register',
        });
        console.log('OTP saved to database');

        res.status(201).json({ message: 'User registered. Check email for OTP.', userId: newUser.id });
    } catch (error) {
        console.error('Lỗi đăng ký:', error.message, error.stack);
        res.status(500).json({ message: 'Error in registration', error: error.message });
    }
};

export { register };