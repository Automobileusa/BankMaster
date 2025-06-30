import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      toast({
        title: "Order Placed",
        description: "Your checkbook order has been placed successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Unable to place the order. Please try again.",
        variant: "destructive",
      });
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

    // Store the order details and move to OTP verification
    setOrderData(orderDetails);
    setStep('otp');
  };

  const handleOtpVerification = () => {
    if (!otpCode) {
      toast({
        title: "Missing OTP",
        description: "Please enter the OTP code.",
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

    // Call the API to verify OTP and place the order
    // Assuming you have an endpoint to verify OTP and place order
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
          <div>
            <p>Your checkbook order has been placed successfully!</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}