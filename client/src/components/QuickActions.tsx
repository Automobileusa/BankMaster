import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, FileText, Book, Building } from "lucide-react";
import TransferModal from "@/components/modals/TransferModal";
import PayBillModal from "@/components/modals/PayBillModal";
import CheckbookModal from "@/components/modals/CheckbookModal";
import ExternalTransferModal from "@/components/modals/ExternalTransferModal";

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actions = [
    {
      key: 'transfer',
      icon: ArrowLeftRight,
      label: 'Transfer Money',
      color: 'text-blue-600',
    },
    {
      key: 'paybill',
      icon: FileText,
      label: 'Pay Bills',
      color: 'text-blue-600',
    },
    {
      key: 'checkbook',
      icon: Book,
      label: 'Order Checks',
      color: 'text-blue-600',
    },
    {
      key: 'external',
      icon: Building,
      label: 'External Transfer',
      color: 'text-blue-600',
    },
  ];

  const handleActionClick = (actionKey: string) => {
    setActiveModal(actionKey);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <Card className="shadow-key mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.key}
                  variant="outline"
                  className="p-4 h-auto flex flex-col items-center gap-2 hover:bg-gray-50 border-gray-200"
                  onClick={() => handleActionClick(action.key)}
                >
                  <IconComponent className={`h-8 w-8 ${action.color}`} />
                  <span className="text-sm font-semibold text-center">
                    {action.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {activeModal === 'transfer' && (
        <TransferModal onClose={closeModal} />
      )}
      {activeModal === 'paybill' && (
        <PayBillModal onClose={closeModal} />
      )}
      {activeModal === 'checkbook' && (
        <CheckbookModal onClose={closeModal} />
      )}
      {activeModal === 'external' && (
        <ExternalTransferModal onClose={closeModal} />
      )}
    </>
  );
}
