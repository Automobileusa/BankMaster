import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Account } from "@/types/banking";

interface AccountCardProps {
  account: Account;
}

export default function AccountCard({ account }: AccountCardProps) {
  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking':
        return 'CHECKING';
      case 'savings':
        return 'SAVINGS';
      case 'credit':
        return 'CREDIT CARD';
      default:
        return type.toUpperCase();
    }
  };

  const formatBalance = (balance: string) => {
    const amount = parseFloat(balance);
    if (isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="text-red-600 text-sm font-bold uppercase mb-1">
          {getAccountTypeLabel(account.accountType)}
        </div>
        <div className="text-2xl font-bold text-gray-900">
          ${typeof account.balance === 'string' 
            ? parseFloat(account.balance).toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })
            : (account.balance || 0).toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })
          }
        </div>
        <div className="text-gray-700 text-sm font-medium mb-1">
          {account.accountName || 'Account'}
        </div>
        <div className="text-gray-500 text-sm mb-4">
          ••••{account.accountNumber?.slice(-4) || '0000'}
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-800 text-white text-sm font-semibold"
          size="sm"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}