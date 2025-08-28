import request from 'supertest';
import app from '../server'; // Giả sử server.js là nơi khởi động ứng dụng

describe('Reset Password', () => {
    it('should send OTP to email and reset password successfully', async () => {
        // Giả lập một user đã đăng ký
        const email = 'test@example.com';
        const newPassword = 'newPassword123';

        // Gửi yêu cầu quên mật khẩu
        const forgotResponse = await request(app)
            .post('/api/forgot-password')
            .send({ email });

        expect(forgotResponse.status).toBe(200);
        expect(forgotResponse.body.message).toBe('OTP sent to email');

        // Giả lập OTP (cần lấy từ database hoặc mock)
        const otp = '123456'; // Thay bằng OTP thực tế

        // Gửi yêu cầu đặt lại mật khẩu
        const resetResponse = await request(app)
            .post('/api/reset-password')
            .send({ userId: 1, otp, newPassword }); // userId cần phải là ID thực tế

        expect(resetResponse.status).toBe(200);
        expect(resetResponse.body.message).toBe('Đặt lại mật khẩu thành công');
    });
});
