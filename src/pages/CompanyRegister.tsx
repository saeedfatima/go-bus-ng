import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Mail, Lock, Eye, EyeOff, User, Building2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { currentBackend, api } from '@/services/api';
import OtpVerification from '@/components/auth/OtpVerification';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyDescription: z.string().optional(),
});

const CompanyRegister = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    companyName: '',
    companyDescription: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isDjango = currentBackend === 'django';

  // Check if user is already logged in and has a company
  useEffect(() => {
    if (authLoading) return;
    
    const checkExistingCompany = async () => {
      if (user) {
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();
        
        if (company) {
          navigate('/company/dashboard', { replace: true });
        }
      }
    };
    
    checkExistingCompany();
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (isDjango && error.message === 'OTP_REQUIRED') {
            setShowOtpVerification(true);
          } else if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }
        toast.success('Welcome back!');
        navigate('/company/dashboard');
      } else {
        // Validate form
        const result = registerSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        // Sign up user
        const { error: signUpError } = await signUp(
          formData.email,
          formData.password,
          formData.fullName,
          formData.phone
        );

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            toast.error('An account with this email already exists');
          } else {
            toast.error(signUpError.message);
          }
          setLoading(false);
          return;
        }

        // Django backend: show OTP verification
        if (isDjango) {
          setShowOtpVerification(true);
          toast.success('Account created! Please verify with the OTP sent to your email.');
          setLoading(false);
          return;
        }

        // Supabase flow: wait for auth then create company
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('Failed to create account');
          setLoading(false);
          return;
        }

        // Create company
        const { error: companyError } = await supabase
          .from('companies')
          .insert({
            name: formData.companyName,
            description: formData.companyDescription,
            owner_id: user.id,
          });

        if (companyError) {
          toast.error('Failed to create company: ' + companyError.message);
          setLoading(false);
          return;
        }

        // Add company_admin role
        await supabase.from('user_roles').insert({
          user_id: user.id,
          role: 'company_admin',
        });

        toast.success('Company registered successfully!');
        navigate('/company/dashboard');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
    
    setLoading(false);
  };

  const handleOtpVerify = async (code: string) => {
    if (isDjango && api.auth.verifyOtp) {
      const result = await api.auth.verifyOtp(formData.email, code);
      if (result.error) return { error: result.error };

      // After OTP verification, create company via Django API
      if (!isLogin && result.user) {
        try {
          await api.companies.create(
            { name: formData.companyName, description: formData.companyDescription },
            result.user.id
          );
          await api.userRoles.addRole(result.user.id, 'company_admin');
        } catch (err: any) {
          return { error: new Error('Company creation failed: ' + err.message) };
        }
      }

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
    toast.success(isLogin ? 'Email verified!' : 'Company registered successfully!');
    navigate('/company/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <main className="flex-1 flex items-center justify-center py-12 px-4">
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
                title="Verify Your Email"
                description={isLogin ? undefined : 'Verify your email to complete company registration'}
              />
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    {isLogin ? 'Company Login' : 'Register Your Company'}
                  </h1>
                  <p className="text-muted-foreground">
                    {isLogin
                      ? 'Access your company dashboard'
                      : 'Partner with us to reach more customers'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="companyName"
                            type="text"
                            placeholder="ABC Transport Ltd"
                            className="pl-10"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            required
                          />
                        </div>
                        {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyDescription">Company Description</Label>
                        <Textarea
                          id="companyDescription"
                          placeholder="Tell us about your transport company..."
                          className="min-h-[80px]"
                          value={formData.companyDescription}
                          onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Your Name</Label>
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
                          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="080..."
                              className="pl-10"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              required
                            />
                          </div>
                          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
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
                        placeholder="company@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
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
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Register Company'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-muted-foreground">
                    {isLogin ? "Don't have a company account?" : 'Already registered?'}{' '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-primary font-medium hover:underline"
                    >
                      {isLogin ? 'Register' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Looking to book a trip?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in as a passenger
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default CompanyRegister;
