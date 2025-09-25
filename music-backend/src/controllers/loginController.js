import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, VipPurchase } from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(400).json({ message: 'Invalid email or password' });

        // Check VIP expiry
        const latestVip = await VipPurchase.findOne({
          where: { user_id: user.id },
          order: [['expiry_date', 'DESC']],
        });

        const now = new Date();
        if (latestVip && latestVip.expiry_date > now) {
          user.vip = true;
        } else {
          user.vip = false;
        }
        await user.save();

        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, userId: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Error in login', error: error.message });
    }
};

export { login };
