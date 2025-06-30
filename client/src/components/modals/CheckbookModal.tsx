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

  const checkStyles = [
    { value: 'standard', label: 'Standard Checks - $15.00', price: '15.00' },
    { value: 'designer', label: 'Designer Checks - $25.00', price: '25.00' },
    { value: 'duplicate', label: 'Duplicate Checks - $20.00', price: '20.00' },
  ];

  const quantities = [
    { value: 200, label: '200 checks' },
    { value: 400, label: '400 checks' },
    { value: 600, label: '600 checks' },
  ];

  const orderMutation = useMutation({
    mutationFn: api.checkOrders.create,
    onSuccess: () => {
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Order Placed",
        description: "Your checkbook order has been placed successfully.",
      });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId || !formData.checkStyle || !formData.quantity || !formData.shippingAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedStyle = checkStyles.find(style => style.value === formData.checkStyle);
    if (!selectedStyle) {
      toast({
        title: "Invalid Selection",
        description: "Please select a valid check style.",
        variant: "destructive",
      });
      return;
    }

    const orderDetails = {
      accountId: parseInt(formData.accountId),
      checkStyle: formData.checkStyle,
      quantity: parseInt(formData.quantity),
      price: selectedStyle.price,
      shippingAddress: formData.shippingAddress,
    };

    // Store the order details and request OTP
    setOrderData(orderDetails);
    requestOtpMutation.mutate(orderDetails);
  };

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

  const handleOtpVerification = () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    if (!orderData) {
      toast({
        title: "Order Data Missing",
        description: "Unable to retrieve order details. Please try again.",
        variant: "destructive",
      });
      return;
    }

    orderMutation.mutate({
      ...orderData,
      otpCode: otpCode,
    });
  };

  const checkingAccounts = accounts.filter((account: any) => account.accountType === 'checking');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Order Checkbook</DialogTitle>
          <DialogDescription>
            Order new checks for your checking account with various styles and quantities.
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="account" className="text-sm font-semibold">Account</Label>
              <Select value={formData.accountId} onValueChange={(value) =>
                setFormData({ ...formData, accountId: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select checking account" />
                </SelectTrigger>
                <SelectContent>
                  {checkingAccounts.map((account: any) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.accountName} {account.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="checkStyle" className="text-sm font-semibold">Check Style</Label>
              <Select value={formData.checkStyle} onValueChange={(value) =>
                setFormData({ ...formData, checkStyle: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select check style" />
                </SelectTrigger>
                <SelectContent>
                  {checkStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-sm font-semibold">Quantity</Label>
              <Select value={formData.quantity} onValueChange={(value) =>
                setFormData({ ...formData, quantity: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select quantity" />
                </SelectTrigger>
                <SelectContent>
                  {quantities.map((qty) => (
                    <SelectItem key={qty.value} value={qty.value.toString()}>
                      {qty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="shippingAddress" className="text-sm font-semibold">Shipping Address</Label>
              <Input
                id="shippingAddress"
                placeholder="Enter your complete shipping address"
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 py-3 bg-key-red hover:bg-red-700 text-white font-bold"
                disabled={orderMutation.isPending}
              >
                {orderMutation.isPending ? (
                  <>
                    Placing Order...
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : "Order Checks"}
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
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <p>Please enter the OTP code sent to your registered email address to confirm your order.</p>
            <div>
              <Label htmlFor="otpCode" className="text-sm font-semibold">OTP Code</Label>
              <Input
                type="text"
                id="otpCode"
                placeholder="Enter OTP code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                className="flex-1 py-3 bg-key-red hover:bg-red-700 text-white font-bold"
                onClick={handleOtpVerification}
                disabled={orderMutation.isPending}
              >
                {orderMutation.isPending ? (
                  <>
                    Verifying OTP...
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : "Verify OTP"}
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
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-600 mb-6">Your checkbook order has been placed and will be processed within 5-7 business days.</p>
            <Button onClick={onClose} className="bg-key-red hover:bg-red-700 text-white">
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}