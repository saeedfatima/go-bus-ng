import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/data/mockData';

const popularRoutes = [
  { from: 'Lagos', to: 'Abuja', price: 12000, duration: '8-10 hrs', popularity: 'Most Popular' },
  { from: 'Kano', to: 'Lagos', price: 15000, duration: '12-14 hrs', popularity: 'Trending' },
  { from: 'Port Harcourt', to: 'Lagos', price: 10000, duration: '7-9 hrs', popularity: 'Popular' },
  { from: 'Abuja', to: 'Kaduna', price: 5000, duration: '2-3 hrs', popularity: 'Quick Trip' },
  { from: 'Lagos', to: 'Ibadan', price: 3500, duration: '2-3 hrs', popularity: 'Quick Trip' },
  { from: 'Enugu', to: 'Lagos', price: 11000, duration: '7-8 hrs', popularity: 'Popular' },
];

const PopularRoutes = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Popular Destinations
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trending Routes Across Nigeria
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the most traveled inter-state routes with competitive prices and reliable service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularRoutes.map((route, index) => (
            <Link
              key={`${route.from}-${route.to}`}
              to={`/search?from=${route.from}&to=${route.to}`}
              className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
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
              <div className="flex items-center justify-between">
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

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;
