import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOTP(email: string, otp: string, type: 'register' | 'forgot'): Promise<void> {
    const subject = type === 'register' ? 'Your Registration OTP' : 'Your Password Reset OTP';
    const text = `Your OTP is ${otp}. It expires in 5 minutes.`;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text,
      });
      console.log('Email sent successfully to:', email);
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw error;
    }
  }

  async sendAdminNotification(subject: string, message: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject,
        text: message,
      });
      console.log('Admin notification email sent successfully');
    } catch (error) {
      console.error('Error sending admin notification email:', error.message);
      throw error;
    }
  }
}
