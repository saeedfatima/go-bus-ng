import { Link } from 'react-router-dom';
import { Bus, Facebook, Twitter, Instagram, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Bus className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">NaijaBus</span>
            </Link>
            <p className="text-sm text-background/70 max-w-xs">
              Nigeria's premier bus booking platform. Travel safely with trusted transport companies across the nation.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search" className="text-background/70 hover:text-primary transition-colors">
                  Find Trips
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-background/70 hover:text-primary transition-colors">
                  Bus Companies
                </Link>
              </li>
              <li>
                <Link to="/routes" className="text-background/70 hover:text-primary transition-colors">
                  Popular Routes
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-background/70 hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Routes */}
          <div>
            <h3 className="font-display font-semibold mb-4">Popular Routes</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search?from=Lagos&to=Abuja" className="text-background/70 hover:text-primary transition-colors">
                  Lagos → Abuja
                </Link>
              </li>
              <li>
                <Link to="/search?from=Kano&to=Lagos" className="text-background/70 hover:text-primary transition-colors">
                  Kano → Lagos
                </Link>
              </li>
              <li>
                <Link to="/search?from=PortHarcourt&to=Lagos" className="text-background/70 hover:text-primary transition-colors">
                  Port Harcourt → Lagos
                </Link>
              </li>
              <li>
                <Link to="/search?from=Abuja&to=Kaduna" className="text-background/70 hover:text-primary transition-colors">
                  Abuja → Kaduna
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-background/70">
                <Phone className="h-4 w-4 text-primary" />
                <span>+234 800 123 4567</span>
              </li>
              <li className="flex items-center gap-2 text-background/70">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@naijabus.com</span>
              </li>
              <li className="flex items-start gap-2 text-background/70">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>123 Victoria Island, Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/50">
          <p>© 2024 NaijaBus. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
