
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
import AddPayeeModal from "./AddPayeeModal";

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
  const [showAddPayeeModal, setShowAddPayeeModal] = useState(false);
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

  const handleNewPayee = () => {
    setShowAddPayeeModal(true);
  };

  const handlePayeeAdded = (payeeId: number) => {
    setFormData({ ...formData, payeeId: payeeId.toString() });
    setShowAddPayeeModal(false);
  };

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
      handleNewPayee();
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

    const paymentDate = new Date(formData.paymentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (paymentDate < today) {
      toast({
        title: "Invalid Date",
        description: "Payment date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    setPaymentData({
      payeeId: parseInt(formData.payeeId),
      fromAccountId: parseInt(formData.fromAccountId),
      amount: formData.amount,
      paymentDate: formData.paymentDate,
      memo: formData.memo,
    });

    requestOtpMutation.mutate();
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
      otpCode,
    });
  };

  const renderForm = () => {
    const checkingAccounts = accounts.filter((acc: any) => acc.accountType === 'checking' || acc.accountType === 'savings');

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="payee" className="text-sm font-semibold text-gray-700">
            Payee *
          </Label>
          <Select value={formData.payeeId} onValueChange={(value) => 
            setFormData({ ...formData, payeeId: value })
          }>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select payee" />
            </SelectTrigger>
            <SelectContent>
              {payees.map((payee: any) => (
                <SelectItem key={payee.id} value={payee.id.toString()}>
                  {payee.name}
                </SelectItem>
              ))}
              <SelectItem value="new" className="text-blue-600 font-medium">
                + Add New Payee
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fromAccount" className="text-sm font-semibold text-gray-700">
            From Account *
          </Label>
          <Select value={formData.fromAccountId} onValueChange={(value) => 
            setFormData({ ...formData, fromAccountId: value })
          }>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {checkingAccounts.map((account: any) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.accountName} ({account.accountNumber}) - ${parseFloat(account.balance).toLocaleString()}
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
          <Label htmlFor="paymentDate" className="text-sm font-semibold text-gray-700">
            Payment Date *
          </Label>
          <Input
            id="paymentDate"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
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
            placeholder="Payment description"
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            className="mt-1"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
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
            className="flex-1 py-3 border-gray-300 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  const renderOtpStep = () => (
    <form onSubmit={handleOtpSubmit} className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Payment</h3>
        <p className="text-gray-600 mb-6">
          Enter the 6-digit verification code sent to your email address.
        </p>
      </div>

      <div>
        <Label htmlFor="otpCode" className="text-sm font-semibold text-gray-700">
          Verification Code
        </Label>
        <Input
          id="otpCode"
          type="text"
          placeholder="000000"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="mt-1 text-center text-2xl font-mono tracking-widest"
          maxLength={6}
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
          disabled={payBillMutation.isPending}
        >
          {payBillMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            "Confirm Payment"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 py-3 border-gray-300 hover:bg-gray-50"
          onClick={() => setStep('form')}
        >
          Back
        </Button>
      </div>
    </form>
  );

  const renderSuccess = () => (
    <div className="text-center py-6">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Scheduled Successfully!</h3>
      <p className="text-gray-600 mb-6">
        Your bill payment has been scheduled and will be processed on the selected date.
      </p>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">${parseFloat(formData.amount || '0').toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Date:</span>
            <span className="font-semibold">{new Date(formData.paymentDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <Button
        onClick={onClose}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
      >
        Done
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 'form':
        return renderForm();
      case 'otp':
        return renderOtpStep();
      case 'success':
        return renderSuccess();
      default:
        return renderForm();
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Pay Bills</DialogTitle>
            <DialogDescription className="text-gray-600">
              Schedule bill payments from your checking or savings account.
            </DialogDescription>
          </DialogHeader>

          {renderContent()}
        </DialogContent>
      </Dialog>

      {showAddPayeeModal && (
        <AddPayeeModal 
          onClose={() => setShowAddPayeeModal(false)} 
          onPayeeAdded={handlePayeeAdded}
        />
      )}
    </>
  );
}
