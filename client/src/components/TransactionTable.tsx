import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Transaction } from "@/types/banking";

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5);

  const formatAmount = (amount: string, type: string) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return '$0.00';
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(value));

    return type === 'debit' ? `-${formatted}` : `+${formatted}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'transfer': return 'bg-blue-100 text-blue-800';
      case 'bill_payment': return 'bg-orange-100 text-orange-800';
      case 'external_transfer': return 'bg-green-100 text-green-800';
      case 'deposit': return 'bg-emerald-100 text-emerald-800';
      case 'withdrawal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Transactions */}
      <div className="space-y-2">
        {displayedTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No transactions found matching your search.' : 'No transactions available.'}
          </div>
        ) : (
          displayedTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.transactionDate)}
                    </div>
                  </div>
                  <Badge className={`text-xs ${getCategoryBadgeColor(transaction.category)}`}>
                    {transaction.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className={`font-semibold ${
                transaction.transactionType === 'debit' ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatAmount(transaction.amount, transaction.transactionType)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show More/Less Button */}
      {filteredTransactions.length > 5 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${filteredTransactions.length})`}
          </Button>
        </div>
      )}
    </div>
  );
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const [filter, setFilter] = useState('all');

  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'credit', label: 'Credit' },
    { key: 'debit', label: 'Debit' },
    { key: '2024', label: '2024' },
    { key: '2023', label: '2023' },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'credit' || filter === 'debit') {
      return transaction.transactionType === filter;
    }
    if (filter === '2024' || filter === '2023') {
      const year = new Date(transaction.transactionDate).getFullYear().toString();
      return year === filter;
    }
    return true;
  });

  const formatAmount = (amount: string, type: string) => {
    const value = parseFloat(amount);
    const prefix = type === 'credit' ? '+' : '';
    return `${prefix}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterButtons.map((btn) => (
          <Button
            key={btn.key}
            variant={filter === btn.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(btn.key)}
            className={filter === btn.key ? "bg-blue-600 text-white" : ""}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold">Description</th>
              <th className="text-right py-3 px-4 text-gray-600 font-semibold">Amount</th>
              <th className="text-center py-3 px-4 text-gray-600 font-semibold">Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No transactions found for the selected filter.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-200 last:border-b-0">
                  <td className="py-3 px-4">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.description}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${
                    transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatAmount(transaction.amount, transaction.transactionType)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge 
                      variant={transaction.transactionType === 'credit' ? 'default' : 'destructive'}
                      className={transaction.transactionType === 'credit' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                        : 'bg-red-100 text-red-800 hover:bg-red-100'
                      }
                    >
                      {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
