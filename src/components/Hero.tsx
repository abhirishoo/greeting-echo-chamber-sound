
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-orange-500 text-xs mr-2">✓</span>
              Drive Millions of Eyes to Your Video
            </div>
            
            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8 text-white">
              <span className="block">Grow Your</span>
              <span className="block bg-gradient-to-r from-yellow-200 via-orange-200 to-white bg-clip-text text-transparent">
                YouTube Channel, Fast.
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Get real views. Real results — it starts with signing up.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-gray-50 font-semibold text-lg px-8 py-4 h-14 min-w-[220px] rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                onClick={handleGetStarted}
              >
                {user ? "Go to Dashboard" : "Request Access"}
                <span className="ml-2">→</span>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 font-semibold text-lg px-8 py-4 h-14 min-w-[220px] rounded-full transition-all duration-300"
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">10M+</div>
              <div className="text-white/80 text-sm font-medium">Views Delivered</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-white/80 text-sm font-medium">Happy Creators</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80 text-sm font-medium">Campaign Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
