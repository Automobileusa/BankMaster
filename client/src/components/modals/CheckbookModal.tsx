
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2, CheckCircle } from "lucide-react";

interface CheckbookModalProps {
  onClose: () => void;
}

export default function CheckbookModal({ onClose }: CheckbookModalProps) {
  const [formData, setFormData] = useState({
    accountId: '',
    checkStyle: 'standard',
    quantity: '100',
    shippingAddress: '',
  });
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/accounts"],
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

  const orderChecksMutation = useMutation({
    mutationFn: api.checkOrders.create,
    onSuccess: () => {
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Unable to place the order. Please try again.",
        variant: "destructive",
      });
      setStep('form');
    },
  });

  const calculatePrice = (quantity: number, style: string) => {
    const basePrice = style === 'premium' ? 0.25 : 0.15;
    const total = quantity * basePrice;
    const shipping = 5.99;
    return (total + shipping).toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId || !formData.shippingAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity < 25 || quantity > 500) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a quantity between 25 and 500.",
        variant: "destructive",
      });
      return;
    }

    const price = calculatePrice(quantity, formData.checkStyle);
    
    setOrderData({
      accountId: parseInt(formData.accountId),
      checkStyle: formData.checkStyle,
      quantity,
      price,
      shippingAddress: formData.shippingAddress.trim(),
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

    orderChecksMutation.mutate({
      ...orderData,
      otpCode,
    });
  };

  const renderForm = () => {
    const checkingAccounts = accounts.filter((acc: any) => acc.accountType === 'checking');
    const quantity = parseInt(formData.quantity) || 100;
    const price = calculatePrice(quantity, formData.checkStyle);

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="account" className="text-sm font-semibold text-gray-700">
            Account *
          </Label>
          <Select value={formData.accountId} onValueChange={(value) => 
            setFormData({ ...formData, accountId: value })
          }>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select checking account" />
            </SelectTrigger>
            <SelectContent>
              {checkingAccounts.map((account: any) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.accountName} ({account.accountNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="checkStyle" className="text-sm font-semibold text-gray-700">
            Check Style *
          </Label>
          <Select value={formData.checkStyle} onValueChange={(value) => 
            setFormData({ ...formData, checkStyle: value })
          }>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Checks ($0.15 each)</SelectItem>
              <SelectItem value="premium">Premium Checks ($0.25 each)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
            Quantity *
          </Label>
          <Select value={formData.quantity} onValueChange={(value) => 
            setFormData({ ...formData, quantity: value })
          }>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 checks</SelectItem>
              <SelectItem value="100">100 checks</SelectItem>
              <SelectItem value="150">150 checks</SelectItem>
              <SelectItem value="200">200 checks</SelectItem>
              <SelectItem value="250">250 checks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="shippingAddress" className="text-sm font-semibold text-gray-700">
            Shipping Address *
          </Label>
          <Textarea
            id="shippingAddress"
            placeholder="Enter your complete shipping address"
            value={formData.shippingAddress}
            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
            rows={3}
            className="mt-1"
            required
          />
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Order Summary</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>{quantity} {formData.checkStyle} checks:</span>
              <span>${(quantity * (formData.checkStyle === 'premium' ? 0.25 : 0.15)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & handling:</span>
              <span>$5.99</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-blue-200 pt-1">
              <span>Total:</span>
              <span>${price}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
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
        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Order</h3>
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
          disabled={orderChecksMutation.isPending}
        >
          {orderChecksMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            "Confirm Order"
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
      <h3 className="text-xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h3>
      <p className="text-gray-600 mb-6">
        Your checkbook order has been placed and will be processed within 5-7 business days.
      </p>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Quantity:</span>
            <span className="font-semibold">{formData.quantity} checks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Style:</span>
            <span className="font-semibold capitalize">{formData.checkStyle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-semibold">${calculatePrice(parseInt(formData.quantity), formData.checkStyle)}</span>
          </div>
        </div>
      </div>
      <Button
        onClick={onClose}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
      >
        Done
      </Button>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {step === 'form' ? 'Order Checkbook' : step === 'otp' ? 'Verify Order' : 'Order Complete'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {step === 'form' 
              ? 'Order personalized checks for your account.'
              : step === 'otp'
              ? 'Please verify your order with the code sent to your email.'
              : 'Your checkbook order has been successfully placed.'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && renderForm()}
        {step === 'otp' && renderOtpStep()}
        {step === 'success' && renderSuccess()}
      </DialogContent>
    </Dialog>
  );
}
