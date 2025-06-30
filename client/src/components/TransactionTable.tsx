import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/types/banking";

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
