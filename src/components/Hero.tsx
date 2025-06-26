
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
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

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Horizontal curved orange gradient line - exactly like Pulse Robot */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/30 to-orange-500/40 transform -skew-y-12 origin-top-left"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-orange-500/30 to-orange-600/40 transform skew-y-6 origin-bottom-right"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-left mb-16">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-sm font-medium mb-8">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">✓</span>
              Purpose
            </div>
            
            {/* Main heading - matches Pulse Robot style */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900 max-w-3xl">
              <span className="block">Swish View: Where Growth</span>
              <span className="block">Meets Motion</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
              The YouTube companion that learns and adapts alongside you.
            </p>
            
            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-6 justify-start items-start mb-16">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-lg px-8 py-4 h-14 min-w-[200px] rounded-full border border-orange-500 transition-all duration-300 transform hover:scale-105"
                onClick={handleGetStarted}
              >
                {user ? "Go to Dashboard" : "Request Access"}
                <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
