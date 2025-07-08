import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SwishViewLogo from "@/components/SwishViewLogo";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { supabase } from "@/integrations/supabase/client";

interface DashboardNavbarProps {
  user?: any;
}

const DashboardNavbar = ({ user }: DashboardNavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    console.log("Signing out...");
    await supabase.auth.signOut();
    localStorage.removeItem('swishview_user');
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/95 shadow-sm" : "bg-white/95 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <SwishViewLogo size="xl" />
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <UserAvatar user={user} />
            <span className="text-sm text-gray-600 hidden sm:inline font-display">
              Welcome, {user?.email}
            </span>
            <Button 
              variant="outline" 
              onClick={handleSignOut} 
              size="sm" 
              className="rounded-full border-gray-300 hover:border-orange-500 hover:text-orange-500 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;