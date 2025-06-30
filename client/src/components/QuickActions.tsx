import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, CreditCard, Receipt, Send } from "lucide-react";
import TransferModal from "./modals/TransferModal";
import PayBillModal from "./modals/PayBillModal";
import CheckbookModal from "./modals/CheckbookModal";
import ExternalTransferModal from "./modals/ExternalTransferModal";

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => setActiveModal(null);

  const quickActions = [
    {
      id: "transfer",
      title: "Transfer Money",
      description: "Between your accounts",
      icon: ArrowRightLeft,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "pay-bill",
      title: "Pay Bills",
      description: "Pay your bills online",
      icon: Receipt,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "order-checks",
      title: "Order Checks",
      description: "Order new checkbooks",
      icon: CreditCard,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      id: "external-transfer",
      title: "Send Money",
      description: "Zelle and external transfers",
      icon: Send,
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 ${action.color} text-white border-none transition-colors`}
                  onClick={() => setActiveModal(action.id)}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {activeModal === "transfer" && <TransferModal onClose={closeModal} />}
      {activeModal === "pay-bill" && <PayBillModal onClose={closeModal} />}
      {activeModal === "order-checks" && <CheckbookModal onClose={closeModal} />}
      {activeModal === "external-transfer" && <ExternalTransferModal onClose={closeModal} />}
    </>
  );
}