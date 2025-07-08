
import React from "react";
import { BarChart3, Users, MessageSquare, Video, CreditCard, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminSection } from "./AdminDashboard";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  collapsed, 
  onToggleCollapse 
}) => {
  const menuItems = [
    {
      id: "overview" as AdminSection,
      label: "Overview",
      icon: BarChart3,
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
    {
      id: "users" as AdminSection,
      label: "Users",
      icon: UserCheck,
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
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white/90 backdrop-blur-sm shadow-elegant border-r border-gray-200/50 flex flex-col transition-all duration-300 ease-in-out relative`}>
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-gray-600" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-gray-600" />
        )}
      </button>

      {/* Header - No logo, clean and simple */}
      <div className="p-6 border-b border-gray-200/50">
        {!collapsed && (
          <div className="transition-opacity duration-200">
            <h2 className="text-lg font-display font-bold text-gray-900">Admin Panel</h2>
            <p className="text-xs font-sans text-gray-500">Management Console</p>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 text-left group relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                  : "text-gray-700 hover:bg-gray-100/70 hover:text-orange-600"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 transition-transform duration-300 flex-shrink-0 ${
                isActive ? 'scale-110' : 'group-hover:scale-110'
              }`} />
              {!collapsed && (
                <span className="font-medium font-sans transition-opacity duration-200">
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
              {isActive && collapsed && (
                <div className="absolute right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50">
        <div className={`text-xs font-sans text-gray-500 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? 'v2.0' : 'SwishView Admin v2.0'}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
