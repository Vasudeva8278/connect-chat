import { useState } from 'react';
import { Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OtpFormProps {
  mobileNumber: string;
  onSubmit: (otp: string) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export function OtpForm({ mobileNumber, onSubmit, onBack, isLoading, error }: OtpFormProps) {
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4) {
      await onSubmit(otp);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-foreground/20 rounded-full mb-4">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground">Verify OTP</h1>
            <p className="text-primary-foreground/80 mt-2">
              Enter the code sent to {mobileNumber}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-foreground font-medium">
                OTP Code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="h-12 text-2xl text-center tracking-[0.5em] font-mono"
                maxLength={6}
              />
              {error && (
                <p className="text-sm text-destructive animate-fade-in">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.length < 4}
              className="w-full h-12 text-lg font-semibold gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <>
                  Verify & Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
