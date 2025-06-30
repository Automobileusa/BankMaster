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

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={`w-full justify-start transition-all duration-200 ${
                  activeSection === item.id 
                    ? "bg-key-red hover:bg-red-700 text-white shadow-md" 
                    : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                } ${isCollapsed ? 'px-2 py-3' : 'px-4 py-3'} ${isCollapsed ? 'min-w-0' : 'min-w-max'}`}
                onClick={() => onSectionChange(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="truncate text-sm font-medium">{item.label}</span>
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </Card>
  );
}