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
    checkStyle: 'classic',
    quantity: 50,
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

  const checkOrderMutation = useMutation({
    mutationFn: api.checkOrders.create,
    onSuccess: () => {
      setStep('success');
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Unable to place the check order. Please try again.",
        variant: "destructive",
      });
      setStep('form');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.shippingAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a shipping address.",
        variant: "destructive",
      });
      return;
    }

    const order = {
      accountId: accounts.find(a => a.accountType === 'checking')?.id || accounts[0]?.id,
      checkStyle: formData.checkStyle,
      quantity: formData.quantity,
      shippingAddress: formData.shippingAddress.trim(),
      price: (formData.quantity * 0.25).toFixed(2), // $0.25 per check
    };

    if (!order.accountId) {
      toast({
        title: "No Account Found",
        description: "Unable to find a valid account for this order.",
        variant: "destructive",
      });
      return;
    }

    setOrderData(order);
    requestOtpMutation.mutate({});
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

    checkOrderMutation.mutate({
      ...orderData,
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
          <h3 className="text-lg font-semibold mb-2">Order Placed Successfully!</h3>
          <p className="text-gray-600 mb-6">Your checkbook order has been placed and will be processed within 5-7 business days.</p>
          <Button onClick={onClose} className="bg-key-red hover:bg-red-700 text-white">
            Continue
          </Button>
        </div>
      );
    }

    if (step === 'otp') {
      return (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Verify Your Identity</h3>
            <p className="text-gray-600 mb-6">Enter the 6-digit verification code sent to your email</p>
          </div>

          <div>
            <Label htmlFor="otpCode" className="text-sm font-semibold">Verification Code</Label>
            <Input
              id="otpCode"
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 py-3 bg-key-red hover:bg-red-700 text-white font-bold"
              disabled={checkOrderMutation.isPending}
            >
              {checkOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Verify & Place Order"
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="checkStyle" className="text-sm font-semibold">Check Style</Label>
            <Select value={formData.checkStyle} onValueChange={(value) => setFormData({ ...formData, checkStyle: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic Blue</SelectItem>
                <SelectItem value="scenic">Scenic Design</SelectItem>
                <SelectItem value="security">High Security</SelectItem>
                <SelectItem value="basic">Basic White</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity" className="text-sm font-semibold">Quantity</Label>
            <Select value={formData.quantity.toString()} onValueChange={(value) => setFormData({ ...formData, quantity: parseInt(value) })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 Checks - $6.25</SelectItem>
                <SelectItem value="50">50 Checks - $12.50</SelectItem>
                <SelectItem value="100">100 Checks - $25.00</SelectItem>
                <SelectItem value="200">200 Checks - $50.00</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="shippingAddress" className="text-sm font-semibold">Shipping Address</Label>
            <textarea
              id="shippingAddress"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              placeholder="Enter your complete shipping address"
              value={formData.shippingAddress}
              onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Cost:</span>
              <span className="text-lg font-bold text-key-red">
                ${(formData.quantity * 0.25).toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Delivery: 5-7 business days
            </p>
          </div>
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Order Checkbook</DialogTitle>
          <DialogDescription>
            Order a new checkbook by providing the payee details and delivery information.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}