import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

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
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const { data: payees = [] } = useQuery({
    queryKey: ["/api/payees"],
  });

  const requestOtpMutation = useMutation({
    mutationFn: api.auth.requestPaymentOtp,
    onSuccess: () => {
      setStep('otp');
      toast({
        title: "Verification Code Sent",
        description: "Please check your email for the verification code.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Code",
        description: error.message || "Unable to send verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const payBillMutation = useMutation({
    mutationFn: api.billPayments.create,
    onSuccess: () => {
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to schedule the payment. Please try again.",
        variant: "destructive",
      });
      setStep('form');
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

    if (formData.payeeId === "new") {
      toast({
        title: "Add New Payee",
        description: "Please create a new payee first before proceeding with payment.",
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

    const payment = {
      payeeId: parseInt(formData.payeeId),
      fromAccountId: parseInt(formData.fromAccountId),
      amount: formData.amount,
      paymentDate: formData.paymentDate,
      memo: formData.memo,
    };

    setPaymentData(payment);
    requestOtpMutation.mutate(payment);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    payBillMutation.mutate({
      ...paymentData,
      otpCode: otpCode,
    });
  };

  const renderContent = () => {
    if (step === 'success') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Payment Scheduled Successfully!</h3>
          <p className="text-gray-600 mb-6">Your bill payment has been scheduled and will be processed on the selected date.</p>
          <Button onClick={onClose} className="bg-key-red hover:bg-red-700 text-white">
            Continue
          </Button>
        </div>
      );
    }

    if (step === 'otp') {
      return (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Verify Your Payment</h3>
            <p className="text-gray-600">Please enter the 6-digit verification code sent to your email.</p>
          </div>

          <div>
            <Label htmlFor="otpCode" className="text-sm font-semibold">Verification Code</Label>
            <Input
              id="otpCode"
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 py-3 bg-key-red hover:bg-red-700 text-white font-bold"
              disabled={payBillMutation.isPending}
            >
              {payBillMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Verify & Schedule Payment"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-3"
              onClick={() => setStep('form')}
            >
              Back
            </Button>
          </div>
        </form>
      );
    }

    return (
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
              disabled={requestOtpMutation.isPending}
            >
              {requestOtpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                "Continue to Verification"
              )}
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
      );
    };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Pay Bills</DialogTitle>
          <DialogDescription>
            Schedule bill payments from your checking or savings account.
          </DialogDescription>
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}