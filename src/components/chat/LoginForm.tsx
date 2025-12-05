import { useState } from 'react';
import { Phone, ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
  onSubmit: (mobileNumber: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [mobileNumber, setMobileNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length >= 10) {
      await onSubmit(mobileNumber);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-foreground/20 rounded-full mb-4">
              <MessageCircle className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground">Welcome Back</h1>
            <p className="text-primary-foreground/80 mt-2">Sign in to continue chatting</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-foreground font-medium">
                Mobile Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="pl-11 h-12 text-lg"
                  maxLength={10}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive animate-fade-in">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || mobileNumber.length < 10}
              className="w-full h-12 text-lg font-semibold gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Sending OTP...
                </span>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Default OTP: <span className="font-mono font-semibold text-foreground">1234</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
