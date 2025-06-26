
import React from "react";
import { BarChart3, Users, MessageSquare, Home, Video, CreditCard } from "lucide-react";
import { AdminSection } from "./AdminDashboard";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    {
      id: "overview" as AdminSection,
      label: "Overview",
      icon: BarChart3,
    },
    {
      id: "subscribers" as AdminSection,
      label: "Subscribers",
      icon: Users,
    },
    {
      id: "messages" as AdminSection,
      label: "Messages",
      icon: MessageSquare,
    },
    {
      id: "campaigns" as AdminSection,
      label: "Campaigns",
      icon: Video,
    },
    {
      id: "payments" as AdminSection,
      label: "Payments",
      icon: CreditCard,
    },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Home className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">SwishView Admin</h2>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
