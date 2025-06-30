
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2, CheckCircle } from "lucide-react";

interface AddPayeeModalProps {
  onClose: () => void;
  onPayeeAdded?: (payeeId: number) => void;
}

export default function AddPayeeModal({ onClose, onPayeeAdded }: AddPayeeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    address: '',
  });
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [addedPayee, setAddedPayee] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addPayeeMutation = useMutation({
    mutationFn: api.payees.create,
    onSuccess: (response) => {
      setAddedPayee(response.payee);
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ["/api/payees"] });
      
      // Show success toast
      toast({
        title: "Payee Added Successfully",
        description: `${formData.name} has been added to your payees and details sent to support.`,
      });

      // Auto-close after 3 seconds if no callback provided
      if (!onPayeeAdded) {
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Payee",
        description: error.message || "Unable to add payee. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the payee name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.address.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the payee address.",
        variant: "destructive",
      });
      return;
    }

    addPayeeMutation.mutate({
      name: formData.name.trim(),
      accountNumber: formData.accountNumber.trim() || undefined,
      address: formData.address.trim(),
    });
  };

  const handleUsePayee = () => {
    if (onPayeeAdded && addedPayee) {
      onPayeeAdded(addedPayee.id);
    }
    onClose();
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="payeeName" className="text-sm font-semibold text-gray-700">
          Payee Name *
        </Label>
        <Input
          id="payeeName"
          type="text"
          placeholder="Enter payee name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="accountNumber" className="text-sm font-semibold text-gray-700">
          Account Number (Optional)
        </Label>
        <Input
          id="accountNumber"
          type="text"
          placeholder="Enter account number"
          value={formData.accountNumber}
          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
          Payee Address *
        </Label>
        <Textarea
          id="address"
          placeholder="Enter complete payee address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
          className="mt-1"
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
          disabled={addPayeeMutation.isPending}
        >
          {addPayeeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Payee...
            </>
          ) : (
            "Add Payee"
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

  const renderSuccess = () => (
    <div className="text-center py-6">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Payee Added Successfully!</h3>
      <p className="text-gray-600 mb-6">
        {formData.name} has been added to your payees and the details have been sent to our support team.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h4 className="font-semibold text-gray-900 mb-2">Payee Details:</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div><strong>Name:</strong> {formData.name}</div>
          {formData.accountNumber && <div><strong>Account:</strong> {formData.accountNumber}</div>}
          <div><strong>Address:</strong> {formData.address}</div>
        </div>
      </div>

      <div className="flex gap-3">
        {onPayeeAdded && (
          <Button
            onClick={handleUsePayee}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
          >
            Use This Payee
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 py-3 border-gray-300 hover:bg-gray-50"
        >
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {step === 'form' ? 'Add New Payee' : 'Payee Added'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {step === 'form' 
              ? 'Add a new payee to your bill pay list by entering their details below.'
              : 'Your payee has been successfully added to your account.'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? renderForm() : renderSuccess()}
      </DialogContent>
    </Dialog>
  );
}
