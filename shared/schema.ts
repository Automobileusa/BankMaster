import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountType: text("account_type").notNull(), // 'checking', 'savings', 'credit'
  accountNumber: text("account_number").notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  accountName: text("account_name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  transactionType: text("transaction_type").notNull(), // 'credit', 'debit'
  category: text("category"),
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payees = pgTable("payees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  accountNumber: text("account_number"),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
});

export const billPayments = pgTable("bill_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  payeeId: integer("payee_id").notNull(),
  fromAccountId: integer("from_account_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'failed'
  memo: text("memo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const checkOrders = pgTable("check_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountId: integer("account_id").notNull(),
  checkStyle: text("check_style").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address").notNull(),
  status: text("status").notNull().default("processing"), // 'processing', 'shipped', 'delivered'
  orderDate: timestamp("order_date").notNull().defaultNow(),
});

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const externalAccounts = pgTable("external_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  routingNumber: text("routing_number").notNull(),
  address: text("address").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  microDeposit1: decimal("micro_deposit_1", { precision: 5, scale: 2 }),
  microDeposit2: decimal("micro_deposit_2", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertPayeeSchema = createInsertSchema(payees).omit({ id: true });
export const insertBillPaymentSchema = createInsertSchema(billPayments).omit({ id: true, createdAt: true });
export const insertCheckOrderSchema = createInsertSchema(checkOrders).omit({ id: true, orderDate: true });
export const insertOtpCodeSchema = createInsertSchema(otpCodes).omit({ id: true, createdAt: true });
export const insertExternalAccountSchema = createInsertSchema(externalAccounts).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Payee = typeof payees.$inferSelect;
export type InsertPayee = z.infer<typeof insertPayeeSchema>;
export type BillPayment = typeof billPayments.$inferSelect;
export type InsertBillPayment = z.infer<typeof insertBillPaymentSchema>;
export type CheckOrder = typeof checkOrders.$inferSelect;
export type InsertCheckOrder = z.infer<typeof insertCheckOrderSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;
export type ExternalAccount = typeof externalAccounts.$inferSelect;
export type InsertExternalAccount = z.infer<typeof insertExternalAccountSchema>;
