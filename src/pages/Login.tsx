import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bus, Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { currentBackend, api } from '@/services/api';
import OtpVerification from '@/components/auth/OtpVerification';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isDjango = currentBackend === 'django';

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification email sent! Please check your inbox.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailNotVerified(false);
    setSignupSuccess(false);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          // Django OTP required
          if (isDjango && error.message === 'OTP_REQUIRED') {
            setShowOtpVerification(true);
          } else if (error.message.toLowerCase().includes('email not confirmed')) {
            setEmailNotVerified(true);
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.phone);
        if (error) {
          toast.error(error.message);
        } else if (isDjango) {
          // Django uses OTP verification
          setShowOtpVerification(true);
          toast.success('Account created! Please verify with the OTP sent to your email.');
        } else {
          setSignupSuccess(true);
          toast.success('Account created! Please check your email to verify your account.');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (code: string) => {
    if (isDjango && api.auth.verifyOtp) {
      const result = await api.auth.verifyOtp(formData.email, code);
      if (result.error) return { error: result.error };
      return {};
    }
    return { error: new Error('OTP verification not available') };
  };

  const handleOtpResend = async () => {
    if (isDjango && api.auth.resendOtp) {
      return api.auth.resendOtp(formData.email);
    }
    return { error: new Error('OTP resend not available') };
  };

  const handleOtpSuccess = () => {
    toast.success('Email verified successfully!');
    navigate('/');
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
            {showOtpVerification ? (
              <OtpVerification
                email={formData.email}
                onVerify={handleOtpVerify}
                onResend={handleOtpResend}
                onSuccess={handleOtpSuccess}
              />
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="text-muted-foreground">
                    {isLogin
                      ? 'Sign in to book your next trip'
                      : 'Join thousands of travelers across Nigeria'}
                  </p>
                </div>

                {/* Email Verification Alert */}
                {emailNotVerified && (
                  <Alert className="mb-4 border-warning bg-warning/10">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <AlertDescription className="flex flex-col gap-2">
                      <span className="text-warning-foreground">
                        Your email address hasn't been verified yet. Please check your inbox.
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleResendVerification}
                        disabled={resendingVerification}
                        className="self-start"
                      >
                        {resendingVerification ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Resend Verification Email
                          </>
                        )}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Signup Success Alert */}
                {signupSuccess && (
                  <Alert className="mb-4 border-primary bg-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <AlertDescription className="flex flex-col gap-2">
                      <span className="text-foreground">
                        Account created successfully! We've sent a verification email to{' '}
                        <strong>{formData.email}</strong>. Please verify your email to continue.
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleResendVerification}
                        disabled={resendingVerification}
                        className="self-start"
                      >
                        {resendingVerification ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Resend Verification Email
                          </>
                        )}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="John Doe"
                            className="pl-10"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            +234
                          </span>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="800 000 0000"
                            className="pl-14"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Password</Label>
                      {isLogin && (
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-muted-foreground">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-primary font-medium hover:underline"
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
