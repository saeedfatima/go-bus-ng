import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TripCard from '@/components/search/TripCard';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, ArrowRight, Calendar, Users, Filter, SortAsc, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('price');

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const passengers = searchParams.get('passengers') || '1';

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['search-trips', from, to, date],
    queryFn: async () => {
      // Build the query based on search params
      let query = supabase
        .from('trips')
        .select(`
          *,
          route:routes(
            *,
            origin_city:cities!routes_origin_city_id_fkey(name, state),
            destination_city:cities!routes_destination_city_id_fkey(name, state),
            company:companies(name, logo_url, rating, total_trips, is_verified)
          ),
          bus:buses(bus_type, amenities, total_seats)
        `)
        .eq('status', 'scheduled')
        .gt('available_seats', 0);

      // Filter by date range if provided
      if (date) {
        const searchDate = parseISO(date);
        query = query
          .gte('departure_time', startOfDay(searchDate).toISOString())
          .lte('departure_time', endOfDay(searchDate).toISOString());
      }

      const { data, error } = await query.order('departure_time', { ascending: true });

      if (error) throw error;

      // Filter by origin/destination if specified
      let filteredData = data || [];
      
      if (from) {
        filteredData = filteredData.filter((trip: any) =>
          trip.route?.origin_city?.name?.toLowerCase().includes(from.toLowerCase())
        );
      }
      
      if (to) {
        filteredData = filteredData.filter((trip: any) =>
          trip.route?.destination_city?.name?.toLowerCase().includes(to.toLowerCase())
        );
      }

      return filteredData;
    },
  });

  const sortedTrips = [...trips].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'departure':
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
      case 'duration':
        return (a.route?.duration_hours || 0) - (b.route?.duration_hours || 0);
      case 'rating':
        return (b.route?.company?.rating || 0) - (a.route?.company?.rating || 0);
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
                <span>{from || 'Any'}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <MapPin className="h-5 w-5 text-accent" />
                <span>{to || 'Any'}</span>
              </div>

              <div className="h-6 w-px bg-border hidden md:block" />

              {/* Date */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(parseISO(date), 'PPP')}</span>
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
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trips.length > 0 ? (
            <div className="space-y-4">
              {sortedTrips.map((trip: any) => (
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
