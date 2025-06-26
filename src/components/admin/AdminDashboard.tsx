
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

export type AdminSection = "overview" | "subscribers" | "messages" | "campaigns" | "payments";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full animate-spin"></div>
          <div className="text-xl text-gray-600">Loading admin dashboard...</div>
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
        return "Campaigns";
      case "payments":
        return "Payment History";
      default:
        return "Dashboard Overview";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {getSectionTitle()}
            </h1>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Back to Site
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
