import { useState, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  onVerify: (code: string) => Promise<{ error?: Error }>;
  onResend: () => Promise<{ error?: Error }>;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const OtpVerification = ({
  email,
  onVerify,
  onResend,
  onSuccess,
  title = 'Verify Your Email',
  description,
}: OtpVerificationProps) => {
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (otpCode.length !== 6) return;
    setIsVerifying(true);
    setError(null);

    const result = await onVerify(otpCode);
    if (result.error) {
      setError(result.error.message || 'Invalid OTP code. Please try again.');
      setOtpCode('');
    } else {
      onSuccess();
    }
    setIsVerifying(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    const result = await onResend();
    if (result.error) {
      setError(result.error.message || 'Failed to resend OTP.');
    } else {
      setResendCooldown(60);
    }
    setIsResending(false);
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otpCode.length === 6) {
      handleVerify();
    }
  }, [otpCode]);

  return (
    <div className="text-center space-y-6">
      <div>
        <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground text-sm">
          {description || `We've sent a 6-digit verification code to`}
        </p>
        <p className="font-medium text-foreground">{email}</p>
      </div>

      {error && (
        <Alert className="border-destructive bg-destructive/10 text-left">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otpCode}
          onChange={setOtpCode}
          disabled={isVerifying}
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

      <Button
        onClick={handleVerify}
        disabled={otpCode.length !== 6 || isVerifying}
        className="w-full"
        size="lg"
      >
        {isVerifying ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </Button>

      <div className="text-sm text-muted-foreground">
        Didn't receive the code?{' '}
        {resendCooldown > 0 ? (
          <span>Resend in {resendCooldown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend OTP'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default OtpVerification;
