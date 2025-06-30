
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2, CheckCircle } from "lucide-react";

interface TransferModalProps {
  onClose: () => void;
}

export default function TransferModal({ onClose }: TransferModalProps) {
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    memo: '',
  });
  const [step, setStep] = useState<'form' | 'success'>('form');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const transferMutation = useMutation({
    mutationFn: api.transfers.create,
    onSuccess: () => {
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Unable to complete the transfer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fromAccountId || !formData.toAccountId || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      toast({
        title: "Invalid Transfer",
        description: "Cannot transfer to the same account.",
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

    transferMutation.mutate({
      fromAccountId: parseInt(formData.fromAccountId),
      toAccountId: parseInt(formData.toAccountId),
      amount: formData.amount,
      memo: formData.memo,
    });
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="fromAccount" className="text-sm font-semibold text-gray-700">
          From Account *
        </Label>
        <Select value={formData.fromAccountId} onValueChange={(value) => 
          setFormData({ ...formData, fromAccountId: value })
        }>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select source account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account: any) => (
              <SelectItem key={account.id} value={account.id.toString()}>
                {account.accountName} ({account.accountNumber}) - ${parseFloat(account.balance).toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="toAccount" className="text-sm font-semibold text-gray-700">
          To Account *
        </Label>
        <Select value={formData.toAccountId} onValueChange={(value) => 
          setFormData({ ...formData, toAccountId: value })
        }>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select destination account" />
          </SelectTrigger>
          <SelectContent>
            {accounts
              .filter((account: any) => account.id.toString() !== formData.fromAccountId)
              .map((account: any) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.accountName} ({account.accountNumber})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
          Amount *
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="memo" className="text-sm font-semibold text-gray-700">
          Memo (Optional)
        </Label>
        <Input
          id="memo"
          type="text"
          placeholder="Transfer description"
          value={formData.memo}
          onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
          disabled={transferMutation.isPending}
        >
          {transferMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Transfer...
            </>
          ) : (
            "Transfer Funds"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 py-3 border-gray-300 hover:bg-gray-50"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  const renderSuccess = () => (
    <div className="text-center py-6">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Transfer Completed Successfully!</h3>
      <p className="text-gray-600 mb-6">
        Your funds have been transferred between accounts.
      </p>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">${parseFloat(formData.amount || '0').toLocaleString()}</span>
          </div>
          {formData.memo && (
            <div className="flex justify-between">
              <span className="text-gray-600">Memo:</span>
              <span className="font-semibold">{formData.memo}</span>
            </div>
          )}
        </div>
      </div>
      <Button
        onClick={onClose}
        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
      >
        Done
      </Button>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {step === 'form' ? 'Transfer Funds' : 'Transfer Complete'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {step === 'form' 
              ? 'Transfer money between your accounts instantly.'
              : 'Your transfer has been completed successfully.'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? renderForm() : renderSuccess()}
      </DialogContent>
    </Dialog>
  );
}
