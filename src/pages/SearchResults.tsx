import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TripCard from '@/components/search/TripCard';
import { generateTrips, formatDate } from '@/data/mockData';
import { Trip } from '@/types';
import { MapPin, ArrowRight, Calendar, Users, Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [sortBy, setSortBy] = useState('price');
  const [isLoading, setIsLoading] = useState(true);

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const passengers = searchParams.get('passengers') || '1';

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const results = generateTrips(from, to, date);
      setTrips(results);
      setIsLoading(false);
    }, 800);
  }, [from, to, date]);

  const sortedTrips = [...trips].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'departure':
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      case 'duration':
        return a.route.durationHours - b.route.durationHours;
      case 'rating':
        return b.company.rating - a.company.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1">
        {/* Search Summary */}
        <div className="bg-card border-b border-border">
          <div className="container py-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Route */}
              <div className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{from}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <MapPin className="h-5 w-5 text-accent" />
                <span>{to}</span>
              </div>

              <div className="h-6 w-px bg-border hidden md:block" />

              {/* Date */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(date)}</span>
              </div>

              <div className="h-6 w-px bg-border hidden md:block" />

              {/* Passengers */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{passengers} Passenger{parseInt(passengers) > 1 ? 's' : ''}</span>
              </div>

              <Button variant="outline" size="sm" className="ml-auto">
                Modify Search
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="container py-8">
          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {isLoading ? 'Searching...' : `${trips.length} trips found`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-9">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Lowest Price</SelectItem>
                  <SelectItem value="departure">Earliest Departure</SelectItem>
                  <SelectItem value="duration">Shortest Duration</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Trip List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                    <div className="h-10 bg-muted rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : trips.length > 0 ? (
            <div className="space-y-4">
              {sortedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🚌</div>
              <h3 className="font-display text-xl font-semibold mb-2">No trips found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or selecting a different date.
              </p>
              <Button variant="outline">Modify Search</Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
