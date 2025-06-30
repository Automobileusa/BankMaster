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
    
    logout: async (): Promise<{ message: string }> => {
      const response = await apiRequest("POST", "/api/auth/logout");
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
  
  transfers: {
    create: async (data: TransferRequest): Promise<{ message: string }> => {
      const response = await apiRequest("POST", "/api/transfers", data);
      return response.json();
    },
  },
  
  payees: {
    getAll: async () => {
      const response = await apiRequest("GET", "/api/payees");
      return response.json();
    },
  },
  
  billPayments: {
    create: async (data: BillPaymentRequest): Promise<{ message: string }> => {
      const response = await apiRequest("POST", "/api/bill-payments", data);
      return response.json();
    },
  },
  
  checkOrders: {
    create: async (data: CheckOrderRequest): Promise<{ message: string }> => {
      const response = await apiRequest("POST", "/api/check-orders", data);
      return response.json();
    },
  },
  
  externalTransfers: {
    create: async (data: ExternalTransferRequest): Promise<{ message: string }> => {
      const response = await apiRequest("POST", "/api/external-transfers", data);
      return response.json();
    },
  },
};
