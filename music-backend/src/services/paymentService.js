// src/services/paymentService.js
import { User } from '../models/index.js'; // Path đầy đủ để tránh lỗi resolve
import { v4 as uuidv4 } from 'uuid';

class PaymentService {
  static async createPaymentSession(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    const sessionId = uuidv4();
    return { sessionId, userId };
  }

  static async simulatePaymentSuccess(userId, sessionId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    user.vip = true;
    await user.save();
    return user;
  }
}

export default PaymentService;