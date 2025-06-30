import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface ExternalTransferModalProps {
  onClose: () => void;
}

export default function ExternalTransferModal({ onClose }: ExternalTransferModalProps) {
  const [formData, setFormData] = useState({
    fromAccountId: '',
    recipient: '',
    amount: '',
    message: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const transferMutation = useMutation({
    mutationFn: api.externalTransfers.create,
    onSuccess: () => {
      toast({
        title: "Transfer Successful",
        description: "Your Zelle transfer has been completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
      onClose();
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

    if (!formData.fromAccountId || !formData.recipient || !formData.amount) {
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

    // Validate email or phone format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;

    if (!emailRegex.test(formData.recipient) && !phoneRegex.test(formData.recipient)) {
      toast({
        title: "Invalid Recipient",
        description: "Please enter a valid email address or phone number.",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      fromAccountId: parseInt(formData.fromAccountId),
      recipient: formData.recipient,
      amount: formData.amount,
      message: formData.message,
    });
  };

  const eligibleAccounts = accounts.filter((account: any) => account.accountType !== 'credit');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">External Transfer (Zelle)</DialogTitle>
          <DialogDescription>
            Send money quickly and securely to friends and family
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fromAccount" className="text-sm font-semibold">From Account</Label>
            <Select value={formData.fromAccountId} onValueChange={(value) => 
              setFormData({ ...formData, fromAccountId: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select source account" />
              </SelectTrigger>
              <SelectContent>
                {eligibleAccounts.map((account: any) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.accountName} {account.accountNumber} - ${parseFloat(account.balance).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recipient" className="text-sm font-semibold">Recipient</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="Enter email or phone number"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
            />
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
            <Label htmlFor="message" className="text-sm font-semibold">Message</Label>
            <Input
              id="message"
              type="text"
              placeholder="What's this for?"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 py-3 bg-key-red hover:bg-red-700 text-white font-bold"
              disabled={transferMutation.isPending}
            >
              {transferMutation.isPending ? "Sending..." : "Send Money"}
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