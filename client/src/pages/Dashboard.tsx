import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import AccountCard from "@/components/AccountCard";
import TransactionTable from "@/components/TransactionTable";
import BalanceChart from "@/components/BalanceChart";
import QuickActions from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions/recent"],
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
    return sum + parseFloat(account.balance || '0');
  }, 0);

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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Good morning, {user.firstName}
          </h1>
          <p className="text-gray-600">
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
        <div className="bg-white rounded-lg shadow-key p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">My Accounts</h2>
            <span className="text-sm text-gray-500">
              Total Balance: ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          {accountsLoading ? (
            <div className="text-center py-8">Loading accounts...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account: any) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-key p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Recent Transactions</h2>
          
          {transactionsLoading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : (
            <TransactionTable transactions={transactions} />
          )}
        </div>

        {/* Balance Overview Chart */}
        <div className="bg-white rounded-lg shadow-key p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Balance Trend</h2>
          <div className="h-80">
            <BalanceChart accounts={accounts} />
          </div>
        </div>
      </div>
    </div>
  );
}
