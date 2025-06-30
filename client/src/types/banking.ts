export interface Account {
  id: number;
  userId: number;
  accountType: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  balance: string;
  accountName: string;
  isActive: boolean;
}

export interface Transaction {
  id: number;
  accountId: number;
  amount: string;
  description: string;
  transactionType: 'credit' | 'debit';
  category?: string;
  transactionDate: string;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

export interface Payee {
  id: number;
  userId: number;
  name: string;
  accountNumber?: string;
  address?: string;
  isActive: boolean;
}

export interface LoginResponse {
  message: string;
  userId?: number;
  requiresOTP?: boolean;
  user?: User;
}

export interface TransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: string;
  memo?: string;
}

export interface BillPaymentRequest {
  payeeId: number;
  fromAccountId: number;
  amount: string;
  paymentDate: string;
  memo?: string;
}

export interface CheckOrderRequest {
  accountId: number;
  checkStyle: string;
  quantity: number;
  price: string;
  shippingAddress: string;
}

export interface ExternalTransferRequest {
  fromAccountId: number;
  recipient: string;
  amount: string;
  message?: string;
}

export interface ExternalAccount {
  id: number;
  userId: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  address: string;
  microDeposit1?: string;
  microDeposit2?: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface Account {
  id: number;
  userId: number;
  accountName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  amount: string;
  description: string;
  transactionType: 'debit' | 'credit';
  category: string;
  transactionDate: string;
  createdAt: string;
}

export interface LoginResponse {
  message: string;
  user?: User;
  userId?: number;
  requiresOTP?: boolean;
}

export interface TransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: string;
  memo?: string;
}

export interface BillPaymentRequest {
  fromAccountId: number;
  payeeId: number;
  amount: string;
  paymentDate: string;
  memo?: string;
}

export interface CheckOrderRequest {
  accountId: number;
  checkStyle: string;
  quantity: number;
  shippingAddress: string;
}

export interface ExternalTransferRequest {
  fromAccountId: number;
  recipient: string;
  amount: string;
  message?: string;
}

export interface Payee {
  id: number;
  userId: number;
  name: string;
  accountNumber?: string;
  address?: string;
  createdAt: string;
}
