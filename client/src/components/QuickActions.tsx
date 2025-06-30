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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, CreditCard, FileText, Send } from "lucide-react";
import TransferModal from "./modals/TransferModal";
import PayBillModal from "./modals/PayBillModal";
import CheckbookModal from "./modals/CheckbookModal";
import ExternalTransferModal from "./modals/ExternalTransferModal";

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actions = [
    {
      id: "transfer",
      title: "Transfer Money",
      description: "Between your accounts",
      icon: ArrowLeftRight,
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      id: "payBill",
      title: "Pay Bills",
      description: "Schedule payments",
      icon: CreditCard,
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      iconColor: "text-green-600",
    },
    {
      id: "external",
      title: "Send Money",
      description: "Zelle & external transfers",
      icon: Send,
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      iconColor: "text-purple-600",
    },
    {
      id: "checkbook",
      title: "Order Checks",
      description: "Get new checkbooks",
      icon: FileText,
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      iconColor: "text-orange-600",
    },
  ];

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              className={`cursor-pointer transition-all ${action.color} border-2`}
              onClick={() => setActiveModal(action.id)}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${action.iconColor}`} />
                <h3 className="font-semibold text-gray-900 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      {activeModal === "transfer" && (
        <TransferModal onClose={closeModal} />
      )}
      {activeModal === "payBill" && (
        <PayBillModal onClose={closeModal} />
      )}
      {activeModal === "checkbook" && (
        <CheckbookModal onClose={closeModal} />
      )}
      {activeModal === "external" && (
        <ExternalTransferModal onClose={closeModal} />
      )}
    </>
  );
}
