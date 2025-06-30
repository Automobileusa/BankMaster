
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Building2, Plus, CheckCircle } from "lucide-react";

interface ExternalAccount {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  address: string;
  isVerified: boolean;
  microDeposit1?: string;
  microDeposit2?: string;
}

export default function ExternalAccountsSection() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ExternalAccount | null>(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    address: '',
  });
  const [verifyData, setVerifyData] = useState({
    amount1: '',
    amount2: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: externalAccounts = [] } = useQuery({
    queryKey: ["/api/external-accounts"],
  });

  const addAccountMutation = useMutation({
    mutationFn: api.externalAccounts.create,
    onSuccess: () => {
      toast({
        title: "Account Added Successfully",
        description: "Your external account has been linked. Check your email for micro-deposit verification.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/external-accounts"] });
      setShowAddModal(false);
      setFormData({
        bankName: '',
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        address: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Account",
        description: error.message || "Unable to add external account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyAccountMutation = useMutation({
    mutationFn: api.externalAccounts.verify,
    onSuccess: () => {
      toast({
        title: "Account Verified Successfully",
        description: "Your external account is now verified and ready to use.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/external-accounts"] });
      setShowVerifyModal(false);
      setVerifyData({ amount1: '', amount2: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Incorrect deposit amounts. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bankName || !formData.accountName || !formData.accountNumber || !formData.routingNumber || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    addAccountMutation.mutate(formData);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verifyData.amount1 || !verifyData.amount2 || !selectedAccount) {
      toast({
        title: "Missing Information",
        description: "Please enter both deposit amounts.",
        variant: "destructive",
      });
      return;
    }

    verifyAccountMutation.mutate({
      accountId: selectedAccount.id,
      amount1: verifyData.amount1,
      amount2: verifyData.amount2,
    });
  };

  const openVerifyModal = (account: ExternalAccount) => {
    setSelectedAccount(account);
    setShowVerifyModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">External Accounts</h2>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-key-red hover:bg-red-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add External Account
        </Button>
      </div>

      <div className="grid gap-4">
        {externalAccounts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No external accounts linked yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Add an external account to transfer money between banks.
              </p>
            </CardContent>
          </Card>
        ) : (
          externalAccounts.map((account: ExternalAccount) => (
            <Card key={account.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{account.bankName}</h3>
                    <p className="text-gray-600">{account.accountName}</p>
                    <p className="text-sm text-gray-500">
                      Account: ****{account.accountNumber.slice(-4)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Routing: {account.routingNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    {account.isVerified ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </div>
                    ) : (
                      <Button
                        onClick={() => openVerifyModal(account)}
                        variant="outline"
                        size="sm"
                      >
                        Verify Deposits
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <Dialog open={true} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add External Account</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bankName" className="text-sm font-semibold">Bank Name</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g., Chase Bank"
                />
              </div>

              <div>
                <Label htmlFor="accountName" className="text-sm font-semibold">Account Name</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="e.g., John's Checking"
                />
              </div>

              <div>
                <Label htmlFor="accountNumber" className="text-sm font-semibold">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Account number"
                />
              </div>

              <div>
                <Label htmlFor="routingNumber" className="text-sm font-semibold">Routing Number</Label>
                <Input
                  id="routingNumber"
                  value={formData.routingNumber}
                  onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                  placeholder="9-digit routing number"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-semibold">Bank Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full bank address"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 py-3 bg-key-red hover:bg-red-700 text-white font-bold"
                  disabled={addAccountMutation.isPending}
                >
                  {addAccountMutation.isPending ? "Adding..." : "Add Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 py-3"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Verify Deposits Modal */}
      {showVerifyModal && selectedAccount && (
        <Dialog open={true} onOpenChange={setShowVerifyModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Verify Micro-Deposits</DialogTitle>
            </DialogHeader>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                We've sent two small deposits to your {selectedAccount.bankName} account. 
                Please enter the exact amounts below to verify your account.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Label htmlFor="amount1" className="text-sm font-semibold">First Deposit Amount</Label>
                <Input
                  id="amount1"
                  type="number"
                  step="0.01"
                  value={verifyData.amount1}
                  onChange={(e) => setVerifyData({ ...verifyData, amount1: e.target.value })}
                  placeholder="0.XX"
                />
              </div>

              <div>
                <Label htmlFor="amount2" className="text-sm font-semibold">Second Deposit Amount</Label>
                <Input
                  id="amount2"
                  type="number"
                  step="0.01"
                  value={verifyData.amount2}
                  onChange={(e) => setVerifyData({ ...verifyData, amount2: e.target.value })}
                  placeholder="0.XX"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 py-3 bg-key-red hover:bg-red-700 text-white font-bold"
                  disabled={verifyAccountMutation.isPending}
                >
                  {verifyAccountMutation.isPending ? "Verifying..." : "Verify Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 py-3"
                  onClick={() => setShowVerifyModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
