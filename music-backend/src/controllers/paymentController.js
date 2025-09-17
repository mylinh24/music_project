import PaymentService from '../services/paymentService.js'; // Chuyển sang import ES Modules

const createSession = async (req, res) => {
  try {
    const userId = req.userId; // Sử dụng req.userId từ authenticateToken
    const { sessionId, userId: returnedUserId } = await PaymentService.createPaymentSession(userId);
    res.json({ sessionId, userId: returnedUserId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const simulateSuccess = async (req, res) => {
  try {
    const { sessionId, userId } = req.query; // Lấy từ URL QR
    if (!sessionId || !userId) throw new Error('Missing sessionId or userId');
    const user = await PaymentService.simulatePaymentSuccess(userId, sessionId);
    res.send(`Thanh toán thành công! Tài khoản của bạn (${user.email}) đã được nâng cấp lên VIP.`);
  } catch (err) {
    res.status(400).send('Lỗi: ' + err.message);
  }
};

export default { createSession, simulateSuccess }; // Export default một object chứa các method