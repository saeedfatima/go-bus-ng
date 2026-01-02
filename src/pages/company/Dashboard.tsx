import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import { 
  Bus, 
  LayoutDashboard, 
  Route, 
  Calendar, 
  Ticket, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { company, companyLoading } = useCompany();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Wait for auth to fully load before making redirect decisions
    if (authLoading) return;
    
    // Give a small delay for state to stabilize after login
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/company/register', { replace: true });
      }
      setHasCheckedAuth(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Only check company after auth is confirmed and stable
    if (!hasCheckedAuth || companyLoading || !user) return;
    
    // Give company query time to complete
    const timer = setTimeout(() => {
      if (!company) {
        navigate('/company/register', { replace: true });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [user, company, hasCheckedAuth, companyLoading, navigate]);

  if (authLoading || companyLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !company) {
    return null;
  }

  const navItems = [
    { href: '/company/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/company/dashboard/buses', label: 'Buses', icon: Bus },
    { href: '/company/dashboard/routes', label: 'Routes', icon: Route },
    { href: '/company/dashboard/trips', label: 'Schedules', icon: Calendar },
    { href: '/company/dashboard/bookings', label: 'Bookings', icon: Ticket },
    { href: '/company/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/company/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
                <Bus className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-foreground">NaijaBus</span>
                <span className="text-[10px] text-muted-foreground -mt-1">Company Portal</span>
              </div>
            </Link>
          </div>

          {/* Company info */}
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                {company.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{company.name}</p>
                <p className="text-xs text-muted-foreground">
                  {company.is_verified ? '✓ Verified' : 'Pending verification'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Sign out */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center px-4 lg:px-6">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-accent mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-foreground">
              {navItems.find(item => isActive(item.href))?.label || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet context={{ company }} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
