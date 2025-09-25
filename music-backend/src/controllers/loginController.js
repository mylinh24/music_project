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

        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Trả về thông tin user bao gồm role
        let avatarData = null;
        if (user.avatar) {
          const buffer = user.avatar;
          let mime = 'image/jpeg';
          if (buffer.length > 4) {
            if (buffer[0] === 0xFF && buffer[1] === 0xD8) mime = 'image/jpeg';
            else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) mime = 'image/png';
            else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) mime = 'image/gif';
          }
          avatarData = `data:${mime};base64,${user.avatar.toString('base64')}`;
        }

        res.status(200).json({ 
          token, 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified,
            avatar: avatarData,
            vip: user.vip,
            role: user.role,
          }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error in login', error: error.message });
    }
};

export { login };
