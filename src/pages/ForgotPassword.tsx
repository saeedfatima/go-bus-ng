import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bus, Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'sent' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if we're on a password reset callback (via URL params for Django)
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      setStep('reset');
    }
  });

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await api.auth.resetPasswordForEmail(email);

      if (result.error) {
        toast.error(result.error.message);
      } else {
        setStep('sent');
        toast.success('Password reset instructions sent!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.auth.updatePassword(newPassword);

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Password updated successfully!');
        window.location.href = '/login';
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const result = await api.auth.resetPasswordForEmail(email);

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Reset email sent again!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-hero">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-lg group-hover:shadow-xl transition-shadow">
                <Bus className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">NaijaBus</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
            {step === 'email' && (
              <>
                <div className="text-center mb-6">
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Forgot Password?
                  </h1>
                  <p className="text-muted-foreground">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                <form onSubmit={handleSendResetEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}

            {step === 'sent' && (
              <div className="text-center py-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">
                  Check Your Email
                </h2>
                <p className="text-muted-foreground mb-4">
                  We've sent a password reset link to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Didn't receive the email? Check your spam folder or
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="mb-4"
                >
                  {isLoading ? 'Sending...' : 'Resend Email'}
                </Button>
                <div className="mt-4">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </div>
            )}

            {step === 'reset' && (
              <>
                <div className="text-center mb-6">
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Set New Password
                  </h1>
                  <p className="text-muted-foreground">
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
