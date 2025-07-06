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
      username: 'CrowfordGovCard',
      password: 'CrowfordM1955',
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
  { description: 'Amazon Purchase', amount: '-1,203.40', type: 'withdraw', date: new Date('2024-01-14') },
  { description: 'Direct Deposit', amount: '3,849.26', type: 'credit', date: new Date('2024-02-08') },
  { description: 'Netflix', amount: '-14.99', type: 'debit', date: new Date('2024-03-05') },
  { description: 'Gas Station', amount: '-87.32', type: 'debit', date: new Date('2024-03-27') },
  { description: 'Check Deposit', amount: '2,744.90', type: 'credit', date: new Date('2024-04-01') },
  { description: 'Uber Ride', amount: '-22.75', type: 'debit', date: new Date('2024-04-13') },
  { description: 'Spotify Subscription', amount: '-12.99', type: 'debit', date: new Date('2024-05-03') },
  { description: 'Mobile Deposit', amount: '-1,015.65', type: 'withdraw', date: new Date('2024-05-16') },
  { description: 'Grocery Store', amount: '-234.11', type: 'debit', date: new Date('2024-06-08') },
  { description: 'Interest Payment', amount: '12.34', type: 'credit', date: new Date('2024-06-19') },
  { description: 'Car Payment', amount: '-410.00', type: 'debit', date: new Date('2024-07-02') },
  { description: 'Phone Bill', amount: '-98.75', type: 'debit', date: new Date('2024-07-21') },
  { description: 'Starbucks', amount: '-9.50', type: 'debit', date: new Date('2024-07-28') },
  { description: 'PayPal Transfer', amount: '-740.60', type: 'withdraw', date: new Date('2024-08-10') },
  { description: 'Restaurant', amount: '-75.33', type: 'debit', date: new Date('2024-08-18') },
  { description: 'Zelle to Mike Johnson', amount: '-200.00', type: 'debit', date: new Date('2024-08-25') },
  { description: 'Electric Bill', amount: '-132.88', type: 'debit', date: new Date('2024-09-06') },
  { description: 'Direct Deposit', amount: '2,600.00', type: 'deposit', date: new Date('2024-09-12') },
  { description: 'Amazon Purchase', amount: '-392.22', type: 'debit', date: new Date('2024-10-04') },
  { description: 'Grocery Store', amount: '-185.64', type: 'debit', date: new Date('2024-10-17') },
  { description: 'ATM Withdrawal', amount: '-500.00', type: 'withdraw', date: new Date('2024-10-22') },
  { description: 'Mobile Deposit', amount: '3,000.00', type: 'deposit', date: new Date('2024-11-03') },
  { description: 'Netflix', amount: '-14.99', type: 'debit', date: new Date('2024-11-05') },
  { description: 'Gas Station', amount: '-74.19', type: 'debit', date: new Date('2024-11-12') },
  { description: 'Interest Payment', amount: '9.88', type: 'credit', date: new Date('2024-11-16') },
  { description: 'Restaurant', amount: '-66.90', type: 'debit', date: new Date('2024-11-25') },
  { description: 'ATM Withdrawal', amount: '-800.00', type: 'withdraw', date: new Date('2024-11-30') },
  { description: 'Starbucks', amount: '-5.45', type: 'debit', date: new Date('2024-12-02') },
  { description: 'Spotify Subscription', amount: '-12.99', type: 'debit', date: new Date('2024-12-03') },
  { description: 'Check Deposit', amount: '1,140.55', type: 'credit', date: new Date('2024-12-06') },
  { description: 'Phone Bill', amount: '-93.22', type: 'debit', date: new Date('2024-12-10') },
  { description: 'Apple iTunes', amount: '-19.99', type: 'debit', date: new Date('2024-12-11') },
  { description: 'Zelle to Mike Johnson', amount: '-475.00', type: 'withdraw', date: new Date('2024-12-14') },
  { description: 'PayPal Transfer', amount: '-1,240.00', type: 'withdraw', date: new Date('2024-12-15') },
  { description: 'Car Payment', amount: '-410.00', type: 'debit', date: new Date('2024-12-16') },
  { description: 'Direct Deposit', amount: '3,050.10', type: 'credit', date: new Date('2024-12-20') },
  { description: 'Amazon Purchase', amount: '-2,017.48', type: 'withdraw', date: new Date('2024-12-21') },
  { description: 'Netflix', amount: '-14.99', type: 'debit', date: new Date('2024-12-22') },
  { description: 'Electric Bill', amount: '-145.62', type: 'debit', date: new Date('2024-12-23') },
  { description: 'ATM Withdrawal', amount: '-600.00', type: 'withdraw', date: new Date('2024-12-24') },
  { description: 'Interest Payment', amount: '7.43', type: 'credit', date: new Date('2024-12-25') },
  { description: 'Grocery Store', amount: '-96.72', type: 'debit', date: new Date('2024-12-26') },
  { description: 'Starbucks', amount: '-8.25', type: 'debit', date: new Date('2024-12-27') },
  { description: 'Spotify Subscription', amount: '-12.99', type: 'debit', date: new Date('2024-12-28') },
  { description: 'Restaurant', amount: '-78.00', type: 'debit', date: new Date('2024-12-29') },
  { description: 'Phone Bill', amount: '-105.50', type: 'debit', date: new Date('2024-12-30') },
  { description: 'Uber Ride', amount: '-18.50', type: 'debit', date: new Date('2024-12-31') },
  { description: 'Apple iTunes', amount: '-2,500.00', type: 'withdraw', date: new Date('2024-11-20') },
  { description: 'Mobile Deposit', amount: '2,910.00', type: 'deposit', date: new Date('2024-11-21') },
  { description: 'Amazon Purchase', amount: '-130.89', type: 'debit', date: new Date('2024-11-22') },
  { description: 'Check Deposit', amount: '3,410.77', type: 'credit', date: new Date('2024-11-23') },
  { description: 'Target Purchase', amount: '-643.11', type: 'debit', date: new Date('2024-11-24') },
  { description: 'Car Payment', amount: '-410.00', type: 'debit', date: new Date('2024-11-26') },
  { description: 'Uber Ride', amount: '-35.20', type: 'debit', date: new Date('2024-11-27') },
  { description: 'Gas Station', amount: '-58.60', type: 'debit', date: new Date('2024-11-28') },
  { description: 'Phone Bill', amount: '-101.75', type: 'debit', date: new Date('2024-11-29') },
  { description: 'Interest Payment', amount: '11.12', type: 'credit', date: new Date('2024-11-30') },
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
