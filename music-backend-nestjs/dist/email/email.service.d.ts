export declare class EmailService {
    private transporter;
    constructor();
    sendOTP(email: string, otp: string, type: 'register' | 'forgot'): Promise<void>;
    sendAdminNotification(subject: string, message: string): Promise<void>;
}
