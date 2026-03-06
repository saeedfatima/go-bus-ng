import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bus, Mail, Lock, Eye, EyeOff, User, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import OtpVerification from '@/components/auth/OtpVerification';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSlowLoad, setIsSlowLoad] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSlowLoad(false);
    // After 5 seconds, show a hint that the server may be waking up (Render free tier)
    const slowTimer = setTimeout(() => setIsSlowLoad(true), 5000);

    try {
      if (isLogin) {
        const result = await api.auth.signIn(formData.email, formData.password);
        if (result.error) {
          if (result.error.message === 'OTP_REQUIRED') {
            setShowOtpVerification(true);
          } else {
            toast.error(result.error.message);
          }
        } else {
          handleAuthSuccess();
        }
      } else {
        const result = await api.auth.signUp(formData.email, formData.password, formData.fullName, formData.phone);
        if (result.error) {
          toast.error(result.error.message);
        } else {
          setShowOtpVerification(true);
          toast.success('Account created! Please verify your identity.');
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'An error occurred');
    } finally {
      clearTimeout(slowTimer);
      setIsLoading(false);
      setIsSlowLoad(false);
    }
  };

  const handleOtpVerify = async (code: string) => {
    if (api.auth.verifyOtp) {
      const result = await api.auth.verifyOtp(formData.email, code);
      if (result.error) return { error: result.error };
      return {};
    }
    return { error: new Error('OTP verification not available') };
  };

  const handleOtpResend = async () => {
    if (api.auth.resendOtp) {
      return api.auth.resendOtp(formData.email);
    }
    return { error: new Error('OTP resend not available') };
  };

  const getRedirectPath = () => {
    const intent = sessionStorage.getItem('bookingIntent');
    if (intent) {
      try {
        const { returnUrl } = JSON.parse(intent);
        if (returnUrl) return returnUrl;
      } catch (e) {
        console.error('Invalid intent in sessionStorage', e);
      }
    }
    return '/';
  };

  const handleAuthSuccess = () => {
    toast.success('Welcome back!');
    navigate(getRedirectPath());
  };

  const handleOtpSuccess = () => {
    toast.success('Verification successful!');
    navigate(getRedirectPath());
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
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        {isSlowLoad ? 'Server waking up, please wait...' : 'Please wait...'}
                      </span>
                    ) : isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                  {isSlowLoad && (
                    <p className="text-xs text-center text-amber-500 flex items-center justify-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      The server is starting up. This may take up to 60 seconds on first use.
                    </p>
                  )}
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
