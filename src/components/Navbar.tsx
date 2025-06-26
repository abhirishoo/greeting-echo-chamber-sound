
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SwishViewLogo from "@/components/SwishViewLogo";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleAuthAction = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleContactClick = () => {
    navigate("/contact");
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <SwishViewLogo size="md" />
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors duration-200"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('specifications')} 
              className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors duration-200"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')} 
              className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors duration-200"
            >
              Testimonials
            </button>
            <button 
              onClick={handleContactClick} 
              className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors duration-200"
            >
              Contact
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/dashboard")}
                  className="text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={handleLogout}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-6 py-2 rounded-full transition-all duration-200 hover:shadow-lg"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={handleAuthAction}
                  className="text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleAuthAction}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-6 py-2 rounded-full transition-all duration-200 hover:shadow-lg"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 pt-4 pb-6 space-y-4">
              <button 
                onClick={() => scrollToSection('how-it-works')} 
                className="block w-full text-left px-2 py-2 text-sm font-medium text-gray-700 hover:text-orange-500"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('specifications')} 
                className="block w-full text-left px-2 py-2 text-sm font-medium text-gray-700 hover:text-orange-500"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')} 
                className="block w-full text-left px-2 py-2 text-sm font-medium text-gray-700 hover:text-orange-500"
              >
                Testimonials
              </button>
              <button 
                onClick={handleContactClick}
                className="block w-full text-left px-2 py-2 text-sm font-medium text-gray-700 hover:text-orange-500"
              >
                Contact
              </button>
              <div className="pt-4 space-y-3">
                {user ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/dashboard")} 
                      className="w-full border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200"
                    >
                      Dashboard
                    </Button>
                    <Button 
                      onClick={handleLogout} 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleAuthAction} 
                      className="w-full border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200"
                    >
                      Sign In
                    </Button>
                    <Button 
                      onClick={handleAuthAction} 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
