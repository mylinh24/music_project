import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTP = async (email, otp, type) => {
    try {
        const subject = type === 'register' ? 'Your Registration OTP' : 'Your Password Reset OTP';
        const text = `Your OTP is ${otp}. It expires in 5 minutes.`;
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text,
        });
        console.log('Email sent successfully to:', email, 'Message ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error.message, error.stack);
        throw error;
    }
};

const sendAdminNotification = async (subject, message) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject,
            text: message,
        });
        console.log('Admin notification email sent successfully. Message ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending admin notification email:', error.message, error.stack);
        throw error;
    }
};

export { sendOTP, sendAdminNotification };
