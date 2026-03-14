import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { companies } from '@/data/mockData';
import { Star, CheckCircle, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Companies = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        {/* Hero */}
        <section className="bg-gradient-hero py-16">
          <div className="container text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Partners
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Trusted Bus Companies
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We partner with Nigeria's most reliable transport companies to ensure safe and comfortable journeys.
            </p>
          </div>
        </section>

        {/* Companies Grid */}
        <section className="container py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, index) => (
              <div
                key={company.id}
                className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{company.logo}</div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-display text-xl font-bold">{company.name}</h3>
                        {company.isVerified && (
                          <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-warning fill-warning" />
                        <span>{company.rating}</span>
                        <span>•</span>
                        <span>{company.totalTrips.toLocaleString()} trips</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-border">
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">50+</p>
                    <p className="text-sm text-muted-foreground">Routes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">100+</p>
                    <p className="text-sm text-muted-foreground">Buses</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>+234 800 123 4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>info@{company.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Lagos, Abuja, Kano, Port Harcourt</span>
                  </div>
                </div>

                {/* Action */}
                <Link to={`/search?company=${company.id}`}>
                  <Button variant="outline" className="w-full gap-2">
                    View Trips
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container pb-16">
          <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
              Are You a Transport Company?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-6">
              Join NaijaBus and reach thousands of passengers daily. Easy setup, powerful tools, and real results.
            </p>
            <Link to="/company/register">
              <Button variant="accent" size="lg" className="gap-2">
                Register Your Company
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Companies;
