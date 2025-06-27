
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
import OTPVerification from "@/components/OTPVerification";

const ADMIN_EMAIL = "admin@swishview.com";
const ADMIN_PASSWORD = "SwishAdmin2024!";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOTPMode, setIsOTPMode] = useState(false);
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
    
    if (!email || email.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Send password reset email using our custom edge function
      const { error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          to: email.trim(),
          subject: 'Reset Your Password - Swish View',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Reset Your Password</h2>
              <p>You requested to reset your password for your Swish View account.</p>
              <p>Click the link below to reset your password:</p>
              <a href="${window.location.origin}/auth?reset=true&email=${encodeURIComponent(email.trim())}" 
                 style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                Reset Password
              </a>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>Best regards,<br>The Swish View Team</p>
            </div>
          `
        }
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
        description: "Failed to send password reset email. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast({
        title: "Google Sign-in Not Available",
        description: "Please use email and password to sign in, or contact support if you need Google authentication.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setIsForgotPassword(false);
    setIsOTPMode(false);
  };

  const handleOTPSuccess = () => {
    navigate("/dashboard");
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
              {isOTPMode ? "Email Verification" : 
               isForgotPassword ? "Reset Password" : 
               isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {isOTPMode ? "Verify your email with a code" :
               isForgotPassword 
                ? "Enter your email to receive password reset instructions"
                : isLogin 
                ? "Sign in to your Swish View account" 
                : "Join Swish View today"
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isOTPMode ? (
            <OTPVerification
              email={email}
              onSuccess={handleOTPSuccess}
              onBack={() => setIsOTPMode(false)}
            />
          ) : isForgotPassword ? (
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
                disabled={loading || !email.trim()}
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
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3 h-12 border-gray-300 hover:bg-gray-50"
                onClick={handleGoogleAuth}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">OR</span>
                </div>
              </div>

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
            </>
          )}

          {!isForgotPassword && !isOTPMode && (
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
