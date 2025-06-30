import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  CreditCard, 
  ArrowRightLeft, 
  Receipt, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Building2
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "accounts", label: "Accounts", icon: CreditCard },
    { id: "transfers", label: "Transfers", icon: ArrowRightLeft },
    { id: "bills", label: "Bill Pay", icon: Receipt },
    { id: "external", label: "External Accounts", icon: Building2 },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  return (
    <Card className={`h-full min-h-[calc(100vh-120px)] transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} shadow-lg`}>
      <div className="p-4 h-full">
        <div className="flex justify-between items-center mb-6">
          {!isCollapsed && (
            <h2 className="text-lg font-bold text-key-red">Menu</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="space-y-1 lg:space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-3 lg:px-4 py-2 lg:py-3 text-left rounded-lg transition-colors text-sm lg:text-base ${
                activeSection === item.id
                  ? 'bg-key-red text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="mr-2 lg:mr-3 h-4 lg:h-5 w-4 lg:w-5 flex-shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </Card>
  );
}