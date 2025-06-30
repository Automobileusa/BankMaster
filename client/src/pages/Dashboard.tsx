import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import AccountCard from "@/components/AccountCard";
import TransactionTable from "@/components/TransactionTable";
import BalanceChart from "@/components/BalanceChart";
import QuickActions from "@/components/QuickActions";
import Sidebar from "@/components/Sidebar";
import ExternalAccountsSection from "@/components/ExternalAccountsSection";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");
  const { toast } = useToast();

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: 1,
  });

  const { data: accounts = [], isLoading: accountsLoading, error: accountsError } = useQuery({
    queryKey: ["/api/accounts"],
    enabled: !!user,
    retry: 1,
  });

  const { data: transactions = [], isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ["/api/transactions/recent"],
    enabled: !!user,
    retry: 1,
  });

  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const totalBalance = accounts.reduce((sum: number, account: any) => {
    const balance = parseFloat(account.balance || '0');
    return sum + (isNaN(balance) ? 0 : balance);
  }, 0);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <>
            {/* Welcome Section */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Good morning, {user.firstName}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Here's your account overview for today, {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Accounts Section */}
            <div className="bg-white rounded-lg shadow-key p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-0">My Accounts</h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  Total Balance: ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {accountsLoading ? (
                <div className="text-center py-8">Loading accounts...</div>
              ) : accountsError ? (
                <div className="text-center py-8 text-red-600">
                  Failed to load accounts. Please refresh the page.
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No accounts found.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {accounts.map((account: any) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-key p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Recent Transactions</h2>

              {transactionsLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : transactionsError ? (
                <div className="text-center py-8 text-red-600">
                  Failed to load transactions. Please refresh the page.
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent transactions found.
                </div>
              ) : (
                <TransactionTable transactions={transactions} />
              )}
            </div>

            {/* Balance Overview Chart */}
            <div className="bg-white rounded-lg shadow-key p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Balance Trend</h2>
              <div className="h-60 sm:h-80">
                <BalanceChart accounts={accounts} />
              </div>
            </div>
          </>
        );

      case "accounts":
        return (
          <div className="bg-white rounded-lg shadow-key p-6">
            <h2 className="text-2xl font-bold mb-6">Account Details</h2>
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No accounts found.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account: any) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            )}
          </div>
        );

      case "transfers":
        return (
          <div className="bg-white rounded-lg shadow-key p-6">
            <h2 className="text-2xl font-bold mb-6">Transfer Money</h2>
            <QuickActions />
          </div>
        );

      case "bills":
        return (
          <div className="bg-white rounded-lg shadow-key p-6">
            <h2 className="text-2xl font-bold mb-6">Bill Pay</h2>
            <p className="text-gray-600 mb-4">Manage your bill payments and schedule new ones.</p>
            <QuickActions />
          </div>
        );

      case "external":
        return <ExternalAccountsSection />;

      case "settings":
        return (
          <div className="bg-white rounded-lg shadow-key p-6">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            <p className="text-gray-600">Manage your account preferences and security settings.</p>
          </div>
        );

      case "help":
        return (
          <div className="bg-white rounded-lg shadow-key p-6">
            <h2 className="text-2xl font-bold mb-6">Help & Support</h2>
            <p className="text-gray-600 mb-4">Get help with your banking needs.</p>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Contact Support</h3>
                <p className="text-sm text-gray-600">Phone: 1-800-KEY-BANK</p>
                <p className="text-sm text-gray-600">Email: support@keybank.com</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Frequently Asked Questions</h3>
                <p className="text-sm text-gray-600">Find answers to common banking questions.</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <>
            {/* Welcome Section */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Good morning, {user.firstName}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Here's your account overview for today, {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Accounts Section */}
            <div className="bg-white rounded-lg shadow-key p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-0">My Accounts</h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  Total Balance: ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {accountsLoading ? (
                <div className="text-center py-8">Loading accounts...</div>
              ) : accountsError ? (
                <div className="text-center py-8 text-red-600">
                  Failed to load accounts. Please refresh the page.
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No accounts found.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {accounts.map((account: any) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-key p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Recent Transactions</h2>

              {transactionsLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : transactionsError ? (
                <div className="text-center py-8 text-red-600">
                  Failed to load transactions. Please refresh the page.
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent transactions found.
                </div>
              ) : (
                <TransactionTable transactions={transactions} />
              )}
            </div>

            {/* Balance Overview Chart */}
            <div className="bg-white rounded-lg shadow-key p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Balance Trend</h2>
              <div className="h-60 sm:h-80">
                <BalanceChart accounts={accounts} />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <img 
            src="https://ibx.key.com/ibxolb/login/images/key-logo.svg" 
            alt="KeyBank" 
            className="h-10"
          />
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, {user.firstName} {user.lastName.charAt(0)}.
            </span>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-600 font-semibold hover:text-red-700"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-1" />
              {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto min-h-screen">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}