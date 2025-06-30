import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Shield } from "lucide-react";

interface OTPModalProps {
  userId: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function OTPModal({ userId, onSuccess, onClose }: OTPModalProps) {
  const [otpCode, setOtpCode] = useState("");
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: (code: string) => api.auth.verifyOtp(userId, code),
    onSuccess: (data) => {
      if (data.user) {
        toast({
          title: "Verification Successful",
          description: `Welcome, ${data.user.firstName}!`,
        });
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired code. Please try again.",
        variant: "destructive",
      });
      setOtpCode("");
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => api.auth.resendOtp(userId),
    onSuccess: () => {
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend verification code.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code.",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate(otpCode);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Security Verification
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center text-gray-600 mb-6">
          We've sent a verification code to your registered email. Please enter it below:
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg font-mono tracking-widest py-3"
              maxLength={6}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 py-3 bg-key-red hover:bg-red-700 text-white font-bold"
              disabled={verifyMutation.isPending || otpCode.length !== 6}
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-3"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
            >
              {resendMutation.isPending ? "Sending..." : "Resend Code"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
