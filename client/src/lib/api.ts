import { apiRequest } from "./queryClient";
import type { 
  LoginResponse, 
  TransferRequest, 
  BillPaymentRequest, 
  CheckOrderRequest, 
  ExternalTransferRequest 
} from "../types/banking";

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<LoginResponse> => {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Login failed');
      }
      return response.json();
    },

    verifyOtp: async (userId: number, code: string): Promise<LoginResponse> => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", { userId, code });
      return response.json();
    },

    resendOtp: async (userId: number): Promise<{ message: string }> => {
      const response = await apiRequest("POST", "/api/auth/resend-otp", { userId });
      return response.json();
    },

    requestPaymentOtp: async (): Promise<{ message: string }> => {
      const response = await apiRequest("POST", "/api/auth/request-payment-otp");
      return response.json();
    },

    logout: async (): Promise<{ message: string }> => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },

    me: async () => {
      const response = await apiRequest("GET", "/api/auth/me");
      return response.json();
    },
  },

  transfers: {
    create: async (transferData: TransferRequest) => {
      const response = await apiRequest("POST", "/api/transfers", transferData);
      return response.json();
    },
  },

  billPayments: {
    create: async (paymentData: BillPaymentRequest & { otpCode: string }) => {
      const response = await apiRequest("POST", "/api/bill-payments", paymentData);
      return response.json();
    },
  },

  checkOrders: {
    create: async (orderData: CheckOrderRequest & { otpCode?: string }) => {
      const response = await apiRequest("POST", "/api/check-orders", orderData);
      return response.json();
    },
  },

  externalTransfers: {
    create: async (transferData: ExternalTransferRequest) => {
      const response = await apiRequest("POST", "/api/external-transfers", transferData);
      return response.json();
    },
  },

  externalAccounts: {
    create: async (accountData: any) => {
      const response = await apiRequest("POST", "/api/external-accounts", accountData);
      return response.json();
    },

    verify: async (verificationData: { accountId: number; amount1: string; amount2: string }) => {
      const response = await apiRequest("POST", "/api/external-accounts/verify", verificationData);
      return response.json();
    },

    me: async () => {
      const response = await apiRequest("GET", "/api/auth/me");
      return response.json();
    },
  },

  accounts: {
    getAll: async () => {
      const response = await apiRequest("GET", "/api/accounts");
      return response.json();
    },
  },

  transactions: {
    getRecent: async (limit = 10) => {
      const response = await apiRequest("GET", `/api/transactions/recent?limit=${limit}`);
      return response.json();
    },

    getByAccount: async (accountId: number) => {
      const response = await apiRequest("GET", `/api/accounts/${accountId}/transactions`);
      return response.json();
    },
  },
};