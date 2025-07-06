import { 
  users, accounts, transactions, payees, billPayments, checkOrders, otpCodes, externalAccounts,
  type User, type InsertUser, type Account, type InsertAccount, 
  type Transaction, type InsertTransaction, type Payee, type InsertPayee,
  type BillPayment, type InsertBillPayment, type CheckOrder, type InsertCheckOrder,
  type OtpCode, type InsertOtpCode, type ExternalAccount, type InsertExternalAccount
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Account operations
  getAccountsByUserId(userId: number): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountBalance(accountId: number, balance: string): Promise<Account | undefined>;

  // Transaction operations
  getTransactionsByAccountId(accountId: number): Promise<Transaction[]>;
  getRecentTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Payee operations
  getPayeesByUserId(userId: number): Promise<Payee[]>;
  createPayee(payee: InsertPayee): Promise<Payee>;

  // Bill payment operations
  getBillPaymentsByUserId(userId: number): Promise<BillPayment[]>;
  createBillPayment(payment: InsertBillPayment): Promise<BillPayment>;

  // Check order operations
  getCheckOrdersByUserId(userId: number): Promise<CheckOrder[]>;
  createCheckOrder(order: InsertCheckOrder): Promise<CheckOrder>;

  // OTP operations
  createOtpCode(otp: InsertOtpCode): Promise<OtpCode>;
  getValidOtpCode(userId: number, code: string): Promise<OtpCode | undefined>;
  markOtpAsUsed(id: number): Promise<void>;

  // External account operations
  getExternalAccountsByUserId(userId: number): Promise<ExternalAccount[]>;
  createExternalAccount(account: InsertExternalAccount): Promise<ExternalAccount>;
  verifyExternalAccount(id: number): Promise<ExternalAccount | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private transactions: Map<number, Transaction>;
  private payees: Map<number, Payee>;
  private billPayments: Map<number, BillPayment>;
  private checkOrders: Map<number, CheckOrder>;
  private otpCodes: Map<number, OtpCode>;
  private externalAccounts: Map<number, ExternalAccount>;
  private currentUserId: number;
  private currentAccountId: number;
  private currentTransactionId: number;
  private currentPayeeId: number;
  private currentBillPaymentId: number;
  private currentCheckOrderId: number;
  private currentOtpId: number;
  private currentExternalAccountId: number;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.transactions = new Map();
    this.payees = new Map();
    this.billPayments = new Map();
    this.checkOrders = new Map();
    this.otpCodes = new Map();
    this.externalAccounts = new Map();
    this.currentUserId = 1;
    this.currentAccountId = 1;
    this.currentTransactionId = 1;
    this.currentPayeeId = 1;
    this.currentBillPaymentId = 1;
    this.currentCheckOrderId = 1;
    this.currentOtpId = 1;
    this.currentExternalAccountId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Create demo user
    const user: User = {
      id: this.currentUserId++,
      username: '197200',
      password: 'MOBblood@',
      email: 'dorris.lowell@email.com',
      firstName: 'Crawford',
      lastName: 'Michael',
      isActive: true,
    };
    this.users.set(user.id, user);

    // Create demo accounts
    const checkingAccount: Account = {
      id: this.currentAccountId++,
      userId: user.id,
      accountType: 'checking',
      accountNumber: '****5478',
      balance: '901600.80',
      accountName: 'Primary Checking',
      isActive: true,
    };
    this.accounts.set(checkingAccount.id, checkingAccount);

    const savingsAccount: Account = {
      id: this.currentAccountId++,
      userId: user.id,
      accountType: 'savings',
      accountNumber: '****7832',
      balance: '49400009.00',
      accountName: 'Primary Savings',
      isActive: true,
    };
    this.accounts.set(savingsAccount.id, savingsAccount);

    const creditAccount: Account = {
      id: this.currentAccountId++,
      userId: user.id,
      accountType: 'Loan',
      accountNumber: '****0172',
      balance: '822000.78',
      accountName: 'Line Of Credit',
      isActive: true,
    };
    this.accounts.set(creditAccount.id, creditAccount);

    // Create demo transactions
    const sampleTransactions = [
  { description: 'Mobile Deposit', amount: '-4,714.47', type: 'withdraw', date: new Date('2025-09-02') },
  { description: 'Restaurant', amount: '-161.02', type: 'debit', date: new Date('2025-04-18') },
  { description: 'Direct Deposit', amount: '-340.45', type: 'debit', date: new Date('2025-01-25') },
  { description: 'Amazon Purchase', amount: '-1,917.69', type: 'withdraw', date: new Date('2025-08-15') },
  { description: 'Restaurant', amount: '1,213.76', type: 'credit', date: new Date('2025-04-20') },
  { description: 'Grocery Store', amount: '3,558.56', type: 'credit', date: new Date('2025-09-16') },
  { description: 'Direct Deposit', amount: '-953.05', type: 'debit', date: new Date('2025-12-23') },
  { description: 'Uber Ride', amount: '429.44', type: 'deposit', date: new Date('2025-05-13') },
  { description: 'Zelle to Mike Johnson', amount: '4,406.82', type: 'credit', date: new Date('2025-07-15') },
  { description: 'Gas Station', amount: '-3,156.30', type: 'withdraw', date: new Date('2025-07-27') },
  { description: 'Netflix', amount: '-4,114.12', type: 'withdraw', date: new Date('2025-09-16') },
  { description: 'Gas Station', amount: '-4,119.66', type: 'debit', date: new Date('2025-10-14') },
  { description: 'ATM Withdrawal', amount: '1,499.40', type: 'deposit', date: new Date('2025-12-28') },
  { description: 'Grocery Store', amount: '3,635.99', type: 'credit', date: new Date('2025-04-27') },
  { description: 'ATM Withdrawal', amount: '861.72', type: 'deposit', date: new Date('2025-07-16') },
  { description: 'Spotify Subscription', amount: '-3,106.49', type: 'withdraw', date: new Date('2025-05-04') },
  { description: 'ATM Withdrawal', amount: '2,326.10', type: 'credit', date: new Date('2025-11-03') },
  { description: 'Amazon Purchase', amount: '-4,312.02', type: 'withdraw', date: new Date('2025-08-13') },
  { description: 'Interest Payment', amount: '273.50', type: 'credit', date: new Date('2025-06-26') },
  { description: 'PayPal Transfer', amount: '-2,436.05', type: 'debit', date: new Date('2025-07-03') },
  { description: 'Uber Ride', amount: '-2,431.18', type: 'debit', date: new Date('2025-02-10') },
  { description: 'Gas Station', amount: '3,342.75', type: 'deposit', date: new Date('2025-05-26') },
  { description: 'Phone Bill', amount: '1,401.67', type: 'deposit', date: new Date('2025-01-12') },
  { description: 'Restaurant', amount: '-2,781.60', type: 'debit', date: new Date('2025-09-04') },
  { description: 'Phone Bill', amount: '-3,107.86', type: 'debit', date: new Date('2025-09-18') },
  { description: 'Grocery Store', amount: '-212.41', type: 'debit', date: new Date('2025-11-04') },
  { description: 'Amazon Purchase', amount: '-4,794.68', type: 'withdraw', date: new Date('2025-01-03') },
  { description: 'Electric Bill', amount: '-1,331.85', type: 'withdraw', date: new Date('2025-04-25') },
  { description: 'Netflix', amount: '-3,750.70', type: 'debit', date: new Date('2025-01-24') },
  { description: 'Car Payment', amount: '-44.73', type: 'debit', date: new Date('2025-06-05') },
  { description: 'ATM Withdrawal', amount: '2,473.61', type: 'credit', date: new Date('2025-01-08') },
  { description: 'Car Payment', amount: '173.07', type: 'credit', date: new Date('2025-09-14') },
  { description: 'Uber Ride', amount: '-3,264.57', type: 'withdraw', date: new Date('2025-03-11') },
  { description: 'Mobile Deposit', amount: '4,670.08', type: 'deposit', date: new Date('2025-03-25') },
  { description: 'Netflix', amount: '-3,231.97', type: 'debit', date: new Date('2025-04-03') },
  { description: 'Interest Payment', amount: '-1,407.64', type: 'withdraw', date: new Date('2025-04-23') },
  { description: 'Interest Payment', amount: '3,330.28', type: 'deposit', date: new Date('2025-08-24') },
  { description: 'Restaurant', amount: '3,635.52', type: 'credit', date: new Date('2025-02-02') },
  { description: 'Spotify Subscription', amount: '-3,710.98', type: 'debit', date: new Date('2025-05-17') },
  { description: 'Target Purchase', amount: '-2,920.27', type: 'debit', date: new Date('2025-07-17') },
  { description: 'ATM Withdrawal', amount: '2,882.06', type: 'deposit', date: new Date('2025-10-13') },
  { description: 'Car Payment', amount: '-1,151.64', type: 'withdraw', date: new Date('2025-10-21') },
  { description: 'Electric Bill', amount: '-135.52', type: 'debit', date: new Date('2025-03-23') },
  { description: 'Amazon Purchase', amount: '-3,652.80', type: 'debit', date: new Date('2025-10-16') },
  { description: 'Netflix', amount: '383.03', type: 'deposit', date: new Date('2025-03-24') },
  { description: 'Zelle to Mike Johnson', amount: '-27.74', type: 'withdraw', date: new Date('2025-03-03') },
  { description: 'Direct Deposit', amount: '4,182.75', type: 'credit', date: new Date('2025-01-23') },
  { description: 'PayPal Transfer', amount: '-1,401.44', type: 'debit', date: new Date('2025-01-01') },
  { description: 'Restaurant', amount: '927.65', type: 'credit', date: new Date('2025-02-11') },
  { description: 'Check Deposit', amount: '4,373.45', type: 'credit', date: new Date('2025-01-10') },
  { description: 'Car Payment', amount: '-4,534.51', type: 'debit', date: new Date('2025-09-08') },
  { description: 'Interest Payment', amount: '-1,154.38', type: 'withdraw', date: new Date('2025-06-13') },
  { description: 'Target Purchase', amount: '645.35', type: 'deposit', date: new Date('2025-05-08') },
  { description: 'Mobile Deposit', amount: '-1,980.25', type: 'withdraw', date: new Date('2025-08-23') },
  { description: 'Check Deposit', amount: '930.89', type: 'credit', date: new Date('2025-07-12') },
  { description: 'Apple iTunes', amount: '-1,563.62', type: 'withdraw', date: new Date('2025-02-01') },
  { description: 'Target Purchase', amount: '3,609.71', type: 'credit', date: new Date('2025-04-01') },
  { description: 'Direct Deposit', amount: '-1,748.94', type: 'withdraw', date: new Date('2025-10-27') },
  { description: 'Starbucks', amount: '-4,905.44', type: 'withdraw', date: new Date('2025-08-12') },
  { description: 'Target Purchase', amount: '154.51', type: 'deposit', date: new Date('2025-05-11') },
];


    sampleTransactions.forEach(tx => {
      const transaction: Transaction = {
        id: this.currentTransactionId++,
        accountId: checkingAccount.id,
        amount: tx.amount,
        description: tx.description,
        transactionType: tx.type,
        category: tx.type === 'credit' ? 'income' : 'expense',
        transactionDate: tx.date,
        createdAt: tx.date,
      };
      this.transactions.set(transaction.id, transaction);
    });

    // Create demo payees
    const defaultPayees = [
      { name: 'Electric Company', accountNumber: '1234567890', address: '123 Power St, City, ST 12345' },
      { name: 'Internet Provider', accountNumber: '0987654321', address: '456 Web Ave, City, ST 12345' },
      { name: 'Credit Card Company', accountNumber: '5555666677', address: '789 Credit Blvd, City, ST 12345' },
    ];

    defaultPayees.forEach(payee => {
      const newPayee: Payee = {
        id: this.currentPayeeId++,
        userId: user.id,
        name: payee.name,
        accountNumber: payee.accountNumber,
        address: payee.address,
        isActive: true,
      };
      this.payees.set(newPayee.id, newPayee);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAccountsByUserId(userId: number): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(account => account.userId === userId && account.isActive);
  }

  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const account: Account = { ...insertAccount, id };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccountBalance(accountId: number, balance: string): Promise<Account | undefined> {
    const account = this.accounts.get(accountId);
    if (account) {
      account.balance = balance;
      this.accounts.set(accountId, account);
      return account;
    }
    return undefined;
  }

  async getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.accountId === accountId)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }

  async getRecentTransactionsByUserId(userId: number, limit = 10): Promise<Transaction[]> {
    const userAccounts = await this.getAccountsByUserId(userId);
    const accountIds = userAccounts.map(acc => acc.id);

    return Array.from(this.transactions.values())
      .filter(tx => accountIds.includes(tx.accountId))
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, limit);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getPayeesByUserId(userId: number): Promise<Payee[]> {
    return Array.from(this.payees.values()).filter(payee => payee.userId === userId && payee.isActive);
  }

  async createPayee(insertPayee: InsertPayee): Promise<Payee> {
    const id = this.currentPayeeId++;
    const payee: Payee = { ...insertPayee, id };
    this.payees.set(id, payee);
    return payee;
  }

  async getBillPaymentsByUserId(userId: number): Promise<BillPayment[]> {
    return Array.from(this.billPayments.values())
      .filter(payment => payment.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createBillPayment(insertBillPayment: InsertBillPayment): Promise<BillPayment> {
    const id = this.currentBillPaymentId++;
    const payment: BillPayment = { 
      ...insertBillPayment, 
      id,
      createdAt: new Date(),
    };
    this.billPayments.set(id, payment);
    return payment;
  }

  async getCheckOrdersByUserId(userId: number): Promise<CheckOrder[]> {
    return Array.from(this.checkOrders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  async createCheckOrder(insertCheckOrder: InsertCheckOrder): Promise<CheckOrder> {
    const id = this.currentCheckOrderId++;
    const order: CheckOrder = { 
      ...insertCheckOrder, 
      id,
      orderDate: new Date(),
    };
    this.checkOrders.set(id, order);
    return order;
  }

  async createOtpCode(insertOtp: InsertOtpCode): Promise<OtpCode> {
    const id = this.currentOtpId++;
    const otp: OtpCode = { 
      ...insertOtp, 
      id,
      createdAt: new Date(),
    };
    this.otpCodes.set(id, otp);
    return otp;
  }

  async getValidOtpCode(userId: number, code: string): Promise<OtpCode | undefined> {
    const now = new Date();
    return Array.from(this.otpCodes.values()).find(
      otp => 
        otp.userId === userId && 
        otp.code === code && 
        !otp.isUsed && 
        new Date(otp.expiresAt) > now
    );
  }

  async markOtpAsUsed(id: number): Promise<void> {
    const otp = this.otpCodes.get(id);
    if (otp) {
      otp.isUsed = true;
      this.otpCodes.set(id, otp);
    }
  }

  async getExternalAccountsByUserId(userId: number): Promise<ExternalAccount[]> {
    return Array.from(this.externalAccounts.values())
      .filter(account => account.userId === userId);
  }

  async createExternalAccount(insertAccount: InsertExternalAccount): Promise<ExternalAccount> {
    const id = this.currentExternalAccountId++;
    const microDeposit1 = (Math.random() * 0.99 + 0.01).toFixed(2);
    const microDeposit2 = (Math.random() * 0.99 + 0.01).toFixed(2);

    const account: ExternalAccount = { 
      ...insertAccount, 
      id,
      isVerified: false,
      microDeposit1,
      microDeposit2,
      createdAt: new Date(),
    };
    this.externalAccounts.set(id, account);
    return account;
  }

  async verifyExternalAccount(id: number): Promise<ExternalAccount | undefined> {
    const account = this.externalAccounts.get(id);
    if (account) {
      account.isVerified = true;
      this.externalAccounts.set(id, account);
    }
    return account;
  }
}

export const storage = new MemStorage();
