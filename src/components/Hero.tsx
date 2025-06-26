
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Orange gradient overlay accents */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-500/20 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 left-0 w-64 h-64 bg-gradient-to-br from-orange-400/15 to-transparent rounded-full blur-2xl"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 text-orange-300 text-sm font-medium mb-8">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">✓</span>
              Drive Millions of Eyes to Your Video
            </div>
            
            {/* Main heading - smaller and centered like Pulse Robot */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-white max-w-2xl mx-auto">
              <span className="block">Grow Your</span>
              <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                YouTube Channel, Fast.
              </span>
            </h1>
            
            {/* Subtitle - smaller and more contained */}
            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Get real views. Real results — it starts with signing up.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-lg px-8 py-4 h-14 min-w-[220px] rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                onClick={handleGetStarted}
              >
                {user ? "Go to Dashboard" : "Request Access"}
                <span className="ml-2">→</span>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-600 bg-gray-800/50 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:border-gray-500 hover:text-white font-semibold text-lg px-8 py-4 h-14 min-w-[220px] rounded-full transition-all duration-300"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
              <div className="text-3xl font-bold text-white mb-2">10M+</div>
              <div className="text-gray-400 text-sm font-medium">Views Delivered</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-400 text-sm font-medium">Happy Creators</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400 text-sm font-medium">Campaign Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
