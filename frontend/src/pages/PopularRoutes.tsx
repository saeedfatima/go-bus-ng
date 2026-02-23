import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Clock, TrendingUp, Search } from 'lucide-react';
import { formatPrice } from '@/data/mockData';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const allRoutes = [
  { from: 'Lagos', to: 'Abuja', price: 12000, duration: '8-10 hrs', popularity: 'Most Popular' },
  { from: 'Kano', to: 'Lagos', price: 15000, duration: '12-14 hrs', popularity: 'Trending' },
  { from: 'Port Harcourt', to: 'Lagos', price: 10000, duration: '7-9 hrs', popularity: 'Popular' },
  { from: 'Abuja', to: 'Kaduna', price: 5000, duration: '2-3 hrs', popularity: 'Quick Trip' },
  { from: 'Lagos', to: 'Ibadan', price: 3500, duration: '2-3 hrs', popularity: 'Quick Trip' },
  { from: 'Enugu', to: 'Lagos', price: 11000, duration: '7-8 hrs', popularity: 'Popular' },
  { from: 'Lagos', to: 'Port Harcourt', price: 10000, duration: '7-9 hrs', popularity: 'Popular' },
  { from: 'Abuja', to: 'Enugu', price: 8000, duration: '4-5 hrs', popularity: 'Trending' },
  { from: 'Kano', to: 'Kaduna', price: 4000, duration: '2-3 hrs', popularity: 'Quick Trip' },
  { from: 'Ibadan', to: 'Lagos', price: 3500, duration: '2-3 hrs', popularity: 'Quick Trip' },
  { from: 'Benin City', to: 'Lagos', price: 6000, duration: '4-5 hrs', popularity: 'Popular' },
  { from: 'Calabar', to: 'Port Harcourt', price: 5500, duration: '3-4 hrs', popularity: 'Popular' },
  { from: 'Owerri', to: 'Lagos', price: 9000, duration: '6-7 hrs', popularity: 'Trending' },
  { from: 'Warri', to: 'Lagos', price: 7500, duration: '5-6 hrs', popularity: 'Popular' },
  { from: 'Jos', to: 'Abuja', price: 6000, duration: '3-4 hrs', popularity: 'Quick Trip' },
];

const PopularRoutesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Explore Nigeria
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Popular Routes Across Nigeria
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Discover the most traveled inter-state routes with competitive prices, 
              reliable service, and comfortable buses from top transport companies.
            </p>
          </div>
        </section>

        {/* Routes Grid */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRoutes.map((route, index) => (
                <div
                  key={`${route.from}-${route.to}-${index}`}
                  className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Popularity Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                      <TrendingUp className="h-3 w-3" />
                      {route.popularity}
                    </span>
                  </div>

                  {/* Route Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{route.from}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2 text-foreground">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span className="font-semibold">{route.to}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{route.duration}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Starting from</p>
                      <p className="font-display text-lg font-bold text-primary">
                        {formatPrice(route.price)}
                      </p>
                    </div>
                  </div>

                  {/* Search Button */}
                  <Link to={`/search?from=${route.from}&to=${route.to}`}>
                    <Button className="w-full" variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Search Trips
                    </Button>
                  </Link>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Can't Find Your Route?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Search for any route across Nigeria. We have partnerships with multiple 
              transport companies covering all major cities.
            </p>
            <Link to="/">
              <Button size="lg" className="hero">
                <Search className="h-5 w-5 mr-2" />
                Search All Routes
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PopularRoutesPage;
