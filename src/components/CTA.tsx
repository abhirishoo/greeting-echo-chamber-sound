
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CTA = () => {
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
    <section className="w-full py-24 bg-white relative overflow-hidden">
      {/* Horizontal curved orange gradient line */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-orange-500/30 to-transparent transform skew-y-3 origin-top-right"></div>
      
      <div className="container px-6 lg:px-8 mx-auto text-left relative z-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Ready to Go Viral?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
            Join thousands of creators who've boosted their YouTube presence with Swish View.
          </p>
          <Button 
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-lg px-10 py-4 h-14 rounded-full transition-all duration-300 transform hover:scale-105 border border-orange-500"
            onClick={handleGetStarted}
          >
            {user ? "Launch New Campaign" : "Start Your Campaign"}
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
