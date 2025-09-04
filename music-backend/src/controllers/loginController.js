import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
<<<<<<< HEAD
        res.status(200).json({ token });
=======
        res.status(200).json({ token, userId: user.id });
>>>>>>> 14f427b2 (second commit)
    } catch (error) {
        res.status(500).json({ message: 'Error in login', error: error.message });
    }
};

export { login };