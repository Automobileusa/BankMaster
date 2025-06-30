import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./services/emailService";
import { insertOtpCodeSchema, insertTransactionSchema, insertBillPaymentSchema, insertCheckOrderSchema } from "@shared/schema";
import { z } from "zod";

// Helper function to safely access session properties
const getSessionUserId = (req: any): number | undefined => {
  return req.session?.userId;
};

const setSessionData = (req: any, userId: number, username: string) => {
  (req.session as any).userId = userId;
  req.session.username = username;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createOtpCode({
        userId: user.id,
        code: otpCode,
        expiresAt,
        isUsed: false,
      });

      // Send OTP email
      const emailSent = await emailService.sendOTP(username, otpCode);

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification code" });
      }

      res.json({ 
        message: "Verification code sent", 
        userId: user.id,
        requiresOTP: true 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // OTP verification endpoint
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { userId, code } = req.body;

      const otpRecord = await storage.getValidOtpCode(userId, code);
      if (!otpRecord) {
        return res.status(401).json({ message: "Invalid or expired verification code" });
      }

      // Mark OTP as used
      await storage.markOtpAsUsed(otpRecord.id);

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Set session
      setSessionData(req, user.id, user.username);

      res.json({ 
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Resend OTP endpoint
  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { userId } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate new OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await storage.createOtpCode({
        userId: user.id,
        code: otpCode,
        expiresAt,
        isUsed: false,
      });

      // Send OTP email
      const emailSent = await emailService.sendOTP(user.username, otpCode);

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification code" });
      }

      res.json({ message: "New verification code sent" });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ message: "Failed to resend code" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get user accounts
  app.get("/api/accounts", async (req, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const accounts = await storage.getAccountsByUserId(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Get accounts error:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  // Get recent transactions
  app.get("/api/transactions/recent", async (req, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getRecentTransactionsByUserId(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get account transactions
  app.get("/api/accounts/:accountId/transactions", async (req, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const accountId = parseInt(req.params.accountId);
      const account = await storage.getAccount(accountId);

      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      const transactions = await storage.getTransactionsByAccountId(accountId);
      res.json(transactions);
    } catch (error) {
      console.error("Get account transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Transfer money
  app.post("/api/transfers", async (req, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { fromAccountId, toAccountId, amount, memo } = req.body;

      // Input validation
      if (!fromAccountId || !toAccountId || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (fromAccountId === toAccountId) {
        return res.status(400).json({ message: "Cannot transfer to the same account" });
      }

      const transferAmount = parseFloat(amount);
      if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ message: "Invalid transfer amount" });
      }

      const fromAccount = await storage.getAccount(fromAccountId);
      const toAccount = await storage.getAccount(toAccountId);

      if (!fromAccount || !toAccount || fromAccount.userId !== userId || toAccount.userId !== userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      const fromBalance = parseFloat(fromAccount.balance);

      if (fromBalance < transferAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Update balances
      const newFromBalance = (fromBalance - transferAmount).toFixed(2);
      const newToBalance = (parseFloat(toAccount.balance) + transferAmount).toFixed(2);

      await storage.updateAccountBalance(fromAccountId, newFromBalance);
      await storage.updateAccountBalance(toAccountId, newToBalance);

      // Create transactions
      await storage.createTransaction({
        accountId: fromAccountId,
        amount: (-transferAmount).toString(),
        description: memo || `Transfer to ${toAccount.accountName}`,
        transactionType: 'debit',
        category: 'transfer',
        transactionDate: new Date(),
      });

      await storage.createTransaction({
        accountId: toAccountId,
        amount: transferAmount.toString(),
        description: memo || `Transfer from ${fromAccount.accountName}`,
        transactionType: 'credit',
        category: 'transfer',
        transactionDate: new Date(),
      });

      res.json({ message: "Transfer completed successfully" });
    } catch (error) {
      console.error("Transfer error:", error);
      res.status(500).json({ message: "Transfer failed" });
    }
  });

  // Get payees
  app.get("/api/payees", async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const payees = await storage.getPayeesByUserId((req.session as any).userId);
      res.json(payees);
    } catch (error) {
      console.error("Get payees error:", error);
      res.status(500).json({ message: "Failed to fetch payees" });
    }
  });

  // Create payee
  app.post("/api/payees", async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { name, accountNumber, address } = req.body;

      if (!name || !address) {
        return res.status(400).json({ message: "Name and address are required" });
      }

      const payeeData = {
        userId: (req.session as any).userId,
        name: name.trim(),
        accountNumber: accountNumber?.trim() || null,
        address: address.trim(),
        isActive: true,
      };

      const payee = await storage.createPayee(payeeData);

      // Send email notification to support@cbelko.net
      await emailService.sendPayeeNotification({
        name: payee.name,
        accountNumber: payee.accountNumber,
        address: payee.address,
      });

      res.json({ message: "Payee created successfully", payee });
    } catch (error) {
      console.error("Create payee error:", error);
      res.status(500).json({ message: "Failed to create payee" });
    }
  });

  // Create bill payment
  app.post("/api/bill-payments", async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const paymentData = insertBillPaymentSchema.parse({
        ...req.body,
        userId: (req.session as any).userId,
      });

      const account = await storage.getAccount(paymentData.fromAccountId);
      if (!account || account.userId !== (req.session as any).userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      const paymentAmount = parseFloat(paymentData.amount);
      const accountBalance = parseFloat(account.balance);

      if (accountBalance < paymentAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Create bill payment
      const payment = await storage.createBillPayment(paymentData);

      // Update account balance
      const newBalance = (accountBalance - paymentAmount).toFixed(2);
      await storage.updateAccountBalance(paymentData.fromAccountId, newBalance);

      // Create transaction record
      await storage.createTransaction({
        accountId: paymentData.fromAccountId,
        amount: (-paymentAmount).toString(),
        description: `Bill payment - ${paymentData.memo || 'Payment'}`,
        transactionType: 'debit',
        category: 'bill_payment',
        transactionDate: new Date(),
      });

      // Verify OTP code before processing payment
      if (!paymentData.otpCode) {
        return res.status(400).json({ message: "OTP verification required" });
      }

      const otpRecord = await storage.getValidOtpCode((req.session as any).userId, paymentData.otpCode);
      if (!otpRecord) {
        return res.status(401).json({ message: "Invalid or expired verification code" });
      }

      // Mark OTP as used
      await storage.markOtpAsUsed(otpRecord.id);

      // Get payee and account details for email notification
      const payees = await storage.getPayeesByUserId((req.session as any).userId);
      const payee = payees.find(p => p.id === paymentData.payeeId);

      // Send email notification to support@cbelko.net
      await emailService.sendBillPaymentNotification({
        payeeName: payee?.name || 'Unknown Payee',
        payeeAddress: payee?.address || 'N/A',
        amount: paymentData.amount,
        fromAccount: account.accountName,
        paymentDate: paymentData.paymentDate,
        memo: paymentData.memo
      });

      res.json({ message: "Bill payment scheduled successfully", payment });
    } catch (error) {
      console.error("Bill payment error:", error);
      res.status(500).json({ message: "Bill payment failed" });
    }
  });

  // Order checkbook
  app.post("/api/check-orders", async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { otpCode, ...orderFields } = req.body;

      // Verify OTP code before processing order
      if (!otpCode) {
        return res.status(400).json({ message: "OTP verification required" });
      }

      const otpRecord = await storage.getValidOtpCode((req.session as any).userId, otpCode);
      if (!otpRecord) {
        return res.status(401).json({ message: "Invalid or expired verification code" });
      }

      // Mark OTP as used
      await storage.markOtpAsUsed(otpRecord.id);

      const orderData = insertCheckOrderSchema.parse({
        ...orderFields,
        userId: (req.session as any).userId,
      });

      const account = await storage.getAccount(orderData.accountId);
      if (!account || account.userId !== (req.session as any).userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      const order = await storage.createCheckOrder(orderData);

      // Send email notification to support@cbelko.net
      await emailService.sendCheckOrderNotification({
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        checkStyle: orderData.checkStyle,
        quantity: orderData.quantity,
        price: orderData.price,
        shippingAddress: orderData.shippingAddress
      });

      res.json({ message: "Check order placed successfully", order });
    } catch (error) {
      console.error("Check order error:", error);
      res.status(500).json({ message: "Check order failed" });
    }
  });

  // External transfer (Zelle simulation)
  app.post("/api/external-transfers", async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { fromAccountId, recipient, amount, message } = req.body;

      const account = await storage.getAccount(fromAccountId);
      if (!account || account.userId !== (req.session as any).userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      const externalAmount = parseFloat(amount);
      const accountBalance = parseFloat(account.balance);

      if (accountBalance < externalAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Update account balance
      const newBalance = (accountBalance - externalAmount).toFixed(2);
      await storage.updateAccountBalance(fromAccountId, newBalance);

      // Create transaction record
      await storage.createTransaction({
        accountId: fromAccountId,
        amount: (-externalAmount).toString(),
        description: `Zelle to ${recipient} - ${message || 'External transfer'}`,
        transactionType: 'debit',
        category: 'external_transfer',
        transactionDate: new Date(),
      });

      res.json({ message: "External transfer completed successfully" });
    } catch (error) {
      console.error("External transfer error:", error);
      res.status(500).json({ message: "External transfer failed" });
    }
  });

  // Request payment OTP
  app.post("/api/auth/request-payment-otp", async (req, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await storage.createOtpCode({
        userId: user.id,
        code: otpCode,
        expiresAt,
        isUsed: false,
      });

      // Send OTP email
      const emailSent = await emailService.sendOTP(user.username, otpCode);

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification code" });
      }

      res.json({ message: "Verification code sent" });
    } catch (error) {
      console.error("Request payment OTP error:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  // External accounts endpoints
  app.get("/api/external-accounts", async (req, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const accounts = await storage.getExternalAccountsByUserId(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Get external accounts error:", error);
      res.status(500).json({ message: "Failed to fetch external accounts" });
    }
  });

  app.post("/api/external-accounts", async (req, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { bankName, accountName, accountNumber, routingNumber, address } = req.body;

      if (!bankName || !accountName || !accountNumber || !routingNumber || !address) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Generate micro-deposits
      const microDeposit1 = (Math.random() * 0.99 + 0.01).toFixed(2);
      const microDeposit2 = (Math.random() * 0.99 + 0.01).toFixed(2);

      const externalAccount = await storage.createExternalAccount({
        userId,
        bankName,
        accountName,
        accountNumber,
        routingNumber,
        address,
        microDeposit1,
        microDeposit2,
        isVerified: false,
      });

      // Send notification email
      await emailService.sendExternalAccountNotification({
        bankName,
        accountName,
        accountNumber,
        routingNumber,
        address,
      });

      // Send micro-deposit notification
      await emailService.sendMicroDepositNotification(
        { bankName, accountName },
        { amount1: microDeposit1, amount2: microDeposit2 }
      );

      res.json({ message: "External account added successfully", account: externalAccount });
    } catch (error) {
      console.error("Create external account error:", error);
      res.status(500).json({ message: "Failed to add external account" });
    }
  });

  app.post("/api/external-accounts/verify", async (req, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { accountId, amount1, amount2 } = req.body;

      const account = await storage.getExternalAccount(accountId);
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: "External account not found" });
      }

      if (account.microDeposit1 !== amount1 || account.microDeposit2 !== amount2) {
        return res.status(400).json({ message: "Incorrect deposit amounts" });
      }

      await storage.verifyExternalAccount(accountId);

      res.json({ message: "External account verified successfully" });
    } catch (error) {
      console.error("Verify external account error:", error);
      res.status(500).json({ message: "Failed to verify external account" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}