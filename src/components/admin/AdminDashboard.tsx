
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "./AdminSidebar";
import DashboardOverview from "./DashboardOverview";
import SubscribersSection from "./SubscribersSection";
import ContactMessagesSection from "./ContactMessagesSection";
import CampaignsSection from "./CampaignsSection";
import PaymentsSection from "./PaymentsSection";
import UsersSection from "./UsersSection";

export type AdminSection = "overview" | "subscribers" | "messages" | "campaigns" | "payments" | "users";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this dashboard.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full animate-spin"></div>
          <div className="text-xl font-display text-gray-600">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview />;
      case "subscribers":
        return <SubscribersSection />;
      case "messages":
        return <ContactMessagesSection />;
      case "campaigns":
        return <CampaignsSection />;
      case "payments":
        return <PaymentsSection />;
      case "users":
        return <UsersSection />;
      default:
        return <DashboardOverview />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "overview":
        return "Dashboard Overview";
      case "subscribers":
        return "Email Subscribers";
      case "messages":
        return "Contact Messages";
      case "campaigns":
        return "Campaign Management";
      case "payments":
        return "Payment Management";
      case "users":
        return "User Management";
      default:
        return "Dashboard Overview";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex relative">
      {/* Ambient glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-blue-50/20 pointer-events-none"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl pointer-events-none"></div>

      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col relative z-10">
        {/* Homepage-style navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 transition-all duration-500">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-display font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {getSectionTitle()}
                  </h1>
                  <p className="text-xs text-gray-600 font-sans">
                    Admin Dashboard - SwishView Management
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Back to Site
              </button>
            </div>
          </div>
        </nav>
        
        <main className="flex-1 p-6 pt-24 overflow-auto">
          <div className="relative">
            {/* Subtle panel glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent rounded-3xl blur-xl pointer-events-none"></div>
            <div className="relative z-10">
              {renderActiveSection()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
