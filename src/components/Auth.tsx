
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import SwishViewLogo from "@/components/SwishViewLogo";
import PolicyModal from "@/components/PolicyModal";

const ADMIN_EMAIL = "admin@swishview.com";
const ADMIN_PASSWORD = "SwishAdmin2024!";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (session.user.email === ADMIN_EMAIL) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    };

    checkExistingSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        if (session && event === 'SIGNED_IN') {
          localStorage.setItem('supabase.auth.token', JSON.stringify(session));
          
          if (session.user.email === ADMIN_EMAIL) {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('supabase.auth.token');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        console.log("Sign in successful:", data);
        
        toast({ 
          title: "Welcome back!", 
          description: "Successfully logged in." 
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 100);
        
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`
          },
        });
        
        if (error) throw error;
        
        console.log("Sign up successful:", data);
        
        toast({ 
          title: "Account created!", 
          description: "Welcome to Swish View! You can now start creating campaigns." 
        });

        if (data.user && !data.user.email_confirmed_at) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!signInError) {
            setTimeout(() => {
              navigate("/dashboard");
            }, 100);
          }
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent!",
        description: "Check your email for instructions to reset your password.",
      });

      setIsForgotPassword(false);
      setEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setIsForgotPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-sm border bg-white">
        <CardHeader className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <SwishViewLogo size="lg" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {isForgotPassword 
                ? "Enter your email to receive password reset instructions"
                : isLogin 
                ? "Sign in to your Swish View account" 
                : "Join Swish View today"
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-gray-300"
                  placeholder="Enter your email address"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white" 
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-orange-500 hover:underline"
                  onClick={() => {
                    setIsForgotPassword(false);
                    resetForm();
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="h-11 border-gray-300"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-gray-300"
                />
              </div>
              
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-orange-500 hover:underline"
                    onClick={() => setIsForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white" 
                disabled={loading}
              >
                {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>
          )}

          {!isForgotPassword && (
            <>
              <div className="text-center text-xs text-gray-500">
                By signing in, you agree to our{" "}
                <button
                  type="button"
                  className="text-orange-500 hover:underline"
                  onClick={() => setIsPolicyOpen(true)}
                >
                  Policy
                </button>.
              </div>

              <div className="text-center text-sm">
                <button
                  type="button"
                  className="text-orange-500 hover:underline"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    resetForm();
                  }}
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <PolicyModal open={isPolicyOpen} onOpenChange={setIsPolicyOpen} />
    </div>
  );
};

export default Auth;
