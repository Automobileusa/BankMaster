import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addPayeeMutation = useMutation({
    mutationFn: api.payees.create,
    onSuccess: (newPayee) => {
      toast({
        title: "Payee Added Successfully",
        description: `${formData.name} has been added to your payees.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payees"] });
      if (onPayeeAdded) {
        onPayeeAdded(newPayee.id);
      }
      onClose();
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Payee</DialogTitle>
          <DialogDescription>
            Add a new payee to your bill pay list by entering their details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="payeeName" className="text-sm font-semibold">
              Payee Name *
            </Label>
            <Input
              id="payeeName"
              type="text"
              placeholder="Enter payee name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="accountNumber" className="text-sm font-semibold">
              Account Number (Optional)
            </Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-semibold">
              Payee Address *
            </Label>
            <Textarea
              id="address"
              placeholder="Enter payee address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 py-3 bg-key-red hover:bg-red-700 text-white font-bold"
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
              className="flex-1 py-3"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}