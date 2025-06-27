
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface OTPVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

const OTPVerification = ({ email, onSuccess, onBack }: OTPVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const { toast } = useToast();

  const sendOTP = async () => {
    if (!email || email.trim() === '') {
      toast({
        title: "Error",
        description: "Please provide a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setSendingOTP(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      toast({
        title: "OTP Sent!",
        description: "Check your email for the verification code.",
      });
    } catch (error: any) {
      console.error('OTP send error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setSendingOTP(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    if (!email || email.trim() === '') {
      toast({
        title: "Error",
        description: "Email is required for verification.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email',
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You have been logged in successfully.",
      });
      onSuccess();
    } catch (error: any) {
      console.error('OTP verify error:', error);
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium">Email Verification</h3>
        <p className="text-sm text-gray-600 mt-1">
          We'll send a 6-digit code to {email}
        </p>
      </div>

      <Button
        onClick={sendOTP}
        disabled={sendingOTP || !email}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        {sendingOTP ? "Sending..." : "Send Verification Code"}
      </Button>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Enter 6-digit verification code
        </Label>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <Button
        onClick={verifyOTP}
        disabled={loading || otp.length !== 6 || !email}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        {loading ? "Verifying..." : "Verify & Sign In"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          className="text-sm text-orange-500 hover:underline"
          onClick={onBack}
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
