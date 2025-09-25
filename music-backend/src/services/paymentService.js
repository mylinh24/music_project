// src/services/paymentService.js
import { User, VipPurchase } from '../models/index.js'; // Import VipPurchase model
import { v4 as uuidv4 } from 'uuid';

// Constants
const POINTS_TO_VND_RATE = 5000; // 50 points = 5000 VND
const POINTS_PER_CONVERSION = 50; // Points needed for conversion
const VIP_PRICE = 5000000; // 5 million VND

class PaymentService {
  static async getUserPoints(userId) {
    console.log('PaymentService.getUserPoints called with userId:', userId);
    const user = await User.findByPk(userId);
    if (!user) {
      console.error('User not found with userId:', userId);
      throw new Error('User not found');
    }
    console.log('User found:', user.email, 'with points:', user.contribution_points);
    return user.contribution_points || 0;
  }

  static calculateDiscount(pointsToConvert) {
    if (!pointsToConvert || pointsToConvert <= 0) return 0;

    // Calculate how many full conversions (50 points each)
    const fullConversions = Math.floor(pointsToConvert / POINTS_PER_CONVERSION);
    const discountAmount = fullConversions * POINTS_TO_VND_RATE;

    return {
      discountAmount,
      pointsUsed: fullConversions * POINTS_PER_CONVERSION,
      remainingPoints: pointsToConvert % POINTS_PER_CONVERSION
    };
  }

  static async createPaymentSession(userId, options = {}) {
    console.log('PaymentService.createPaymentSession called with:', { userId, options });
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const { usePoints = false, pointsToConvert = 0 } = options;

    let discountAmount = 0;
    let finalAmount = VIP_PRICE;

    // Validate and calculate discount if user wants to use points
    if (usePoints) {
      const userPoints = user.contribution_points || 0;
      console.log('User points:', userPoints, 'Points to convert:', pointsToConvert);
      if (pointsToConvert > userPoints) {
        throw new Error('Số điểm quy đổi không được vượt quá số điểm hiện có');
      }

      const discountInfo = this.calculateDiscount(pointsToConvert);
      console.log('Discount info:', discountInfo);
      if (discountInfo.pointsUsed === 0) {
        throw new Error('Số điểm phải là bội số của 50');
      }

      discountAmount = discountInfo.discountAmount;
      finalAmount = VIP_PRICE - discountAmount;
      console.log('Final amount calculated:', finalAmount);
    }

    const sessionId = uuidv4();

    // Create QR data with payment information
    const qrData = {
      sessionId,
      userId,
      amount: finalAmount,
      description: 'Nâng cấp tài khoản VIP - 1 năm',
      usePoints,
      pointsToConvert: usePoints ? pointsToConvert : 0,
      discountAmount,
      finalAmount
    };

    console.log('Returning payment session:', { sessionId, userId, qrData });
    return { sessionId, userId, qrData };
  }

  static async simulatePaymentSuccess(userId, sessionId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // TODO: In real implementation, verify sessionId and payment status
    // For now, just upgrade to VIP and deduct points if used

    user.vip = true;

    // If points were used, deduct them
    // This would be determined from the session data in a real implementation
    // For now, we'll assume points are deducted during QR generation

    await user.save();
    return user;
  }

  static async completePayment(userId, sessionId, pointsUsed = 0) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Calculate final amount after discount
    let finalAmount = VIP_PRICE;
    if (pointsUsed > 0) {
      const discountInfo = this.calculateDiscount(pointsUsed);
      finalAmount = VIP_PRICE - discountInfo.discountAmount;
    }

    // Calculate expiry date: 1 year from now
    const paymentDate = new Date();
    const expiryDate = new Date(paymentDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Create VipPurchase record
    await VipPurchase.create({
      user_id: userId,
      payment_date: paymentDate,
      expiry_date: expiryDate,
      amount: finalAmount,
      points_used: pointsUsed,
    });

    // Upgrade user to VIP
    user.vip = true;

    // Deduct points if any were used
    if (pointsUsed > 0) {
      const currentPoints = user.contribution_points || 0;
      if (currentPoints < pointsUsed) {
        throw new Error('Không đủ điểm để trừ');
      }
      user.contribution_points = currentPoints - pointsUsed;
      console.log(`Deducted ${pointsUsed} points from user ${userId}. Remaining points: ${user.contribution_points}`);
    }

    await user.save();
    console.log(`User ${userId} upgraded to VIP successfully. Points deducted: ${pointsUsed}, Final amount: ${finalAmount}`);
    return user;
  }

  // New method for renewal
  static async renewVip(userId, pointsUsed = 0) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Calculate final amount after discount
    let finalAmount = VIP_PRICE;
    if (pointsUsed > 0) {
      const discountInfo = this.calculateDiscount(pointsUsed);
      finalAmount = VIP_PRICE - discountInfo.discountAmount;
    }

    // Find latest VipPurchase expiry_date
    const latestVip = await VipPurchase.findOne({
      where: { user_id: userId },
      order: [['expiry_date', 'DESC']],
    });

    const now = new Date();
    let newExpiryDate;

    if (latestVip && latestVip.expiry_date > now) {
      // If still active, add 1 year to current expiry_date
      newExpiryDate = new Date(latestVip.expiry_date);
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
    } else {
      // If expired or no record, set expiry_date to 1 year from now
      newExpiryDate = new Date();
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
    }

    // Create new VipPurchase record for renewal
    await VipPurchase.create({
      user_id: userId,
      payment_date: new Date(),
      expiry_date: newExpiryDate,
      amount: finalAmount,
      points_used: pointsUsed,
    });

    // Upgrade user to VIP
    user.vip = true;

    // Deduct points if any were used
    if (pointsUsed > 0) {
      const currentPoints = user.contribution_points || 0;
      if (currentPoints < pointsUsed) {
        throw new Error('Không đủ điểm để trừ');
      }
      user.contribution_points = currentPoints - pointsUsed;
      console.log(`Deducted ${pointsUsed} points from user ${userId}. Remaining points: ${user.contribution_points}`);
    }

    await user.save();
    console.log(`User ${userId} renewed VIP successfully. Points deducted: ${pointsUsed}, Final amount: ${finalAmount}`);
    return user;
  }
}

export default PaymentService;
