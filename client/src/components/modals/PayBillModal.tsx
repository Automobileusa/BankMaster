import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface PayBillModalProps {
  onClose: () => void;
}

export default function PayBillModal({ onClose }: PayBillModalProps) {
  const [formData, setFormData] = useState({
    payeeId: '',
    fromAccountId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    memo: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const { data: payees = [] } = useQuery({
    queryKey: ["/api/payees"],
  });

  const payBillMutation = useMutation({
    mutationFn: api.billPayments.create,
    onSuccess: () => {
      toast({
        title: "Payment Scheduled",
        description: "Your bill payment has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to schedule the payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.payeeId || !formData.fromAccountId || !formData.amount || !formData.paymentDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    payBillMutation.mutate({
      payeeId: parseInt(formData.payeeId),
      fromAccountId: parseInt(formData.fromAccountId),
      amount: formData.amount,
      paymentDate: formData.paymentDate,
      memo: formData.memo,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Pay Bills</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="payee" className="text-sm font-semibold">Payee</Label>
            <Select value={formData.payeeId} onValueChange={(value) => 
              setFormData({ ...formData, payeeId: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select payee" />
              </SelectTrigger>
              <SelectContent>
                {payees.map((payee: any) => (
                  <SelectItem key={payee.id} value={payee.id.toString()}>
                    {payee.name}
                  </SelectItem>
                ))}
                <SelectItem value="new">+ Add New Payee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fromAccount" className="text-sm font-semibold">From Account</Label>
            <Select value={formData.fromAccountId} onValueChange={(value) => 
              setFormData({ ...formData, fromAccountId: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter((account: any) => account.accountType !== 'credit').map((account: any) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.accountName} {account.accountNumber} - ${parseFloat(account.balance).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount" className="text-sm font-semibold">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="paymentDate" className="text-sm font-semibold">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label htmlFor="memo" className="text-sm font-semibold">Memo (Optional)</Label>
            <Input
              id="memo"
              type="text"
              placeholder="Payment description"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 py-3 bg-key-red hover:bg-red-700 text-white font-bold"
              disabled={payBillMutation.isPending}
            >
              {payBillMutation.isPending ? "Scheduling..." : "Schedule Payment"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-3"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
