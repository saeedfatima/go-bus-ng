import { Link } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 md:p-12 lg:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                <Building2 className="h-4 w-4" />
                For Transport Companies
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Grow Your Business with NaijaBus
              </h2>
              <p className="text-white/80 mb-6 max-w-md">
                Join our platform to reach thousands of passengers daily. Manage your fleet, schedules, and bookings all in one place.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'Increase your bookings by up to 300%',
                  'Easy-to-use company dashboard',
                  'Real-time seat management',
                  'Secure payment processing',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-white/90 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/company/register">
                <Button variant="accent" size="lg" className="gap-2">
                  Register Your Company
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Visual */}
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-white/10 flex items-center justify-center">
                    <div className="text-8xl">🚌</div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 px-4 py-2 bg-white rounded-xl shadow-lg animate-float">
                  <p className="font-display font-bold text-primary">+300%</p>
                  <p className="text-xs text-muted-foreground">More bookings</p>
                </div>
                <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-white rounded-xl shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <p className="font-display font-bold text-accent">50+</p>
                  <p className="text-xs text-muted-foreground">Partner companies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
