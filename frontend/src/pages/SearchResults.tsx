import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TripCard from '@/components/search/TripCard';
import { api, ApiTrip } from '@/services/api';
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
  const date = searchParams.get('date') || '';
  const passengers = searchParams.get('passengers') || '1';

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['search-trips', from, to, date, passengers],
    queryFn: async () => {
      // Fetch all cities to resolve names to IDs (only if from/to are provided)
      let originCityId = undefined;
      let destinationCityId = undefined;

      const fromName = from === 'all' ? '' : from;
      const toName = to === 'all' ? '' : to;

      if (fromName || toName) {
        const allCities = await api.cities.getAll();
        if (fromName) {
          originCityId = allCities.find(c => c.name.toLowerCase() === fromName.toLowerCase())?.id;
        }
        if (toName) {
          destinationCityId = allCities.find(c => c.name.toLowerCase() === toName.toLowerCase())?.id;
        }
      }


      return await api.trips.search({
        originCityId,
        destinationCityId,
        departureDate: date || undefined,
        passengers: parseInt(passengers),
      });
    },
  });


  const sortedTrips = [...trips].sort((a: ApiTrip, b: ApiTrip) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'departure':
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      case 'duration':
        return (a.route?.durationHours || 0) - (b.route?.durationHours || 0);
      case 'rating':
        return (b.company?.rating || 0) - (a.company?.rating || 0);
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
                <span>{(from && from !== 'all') ? from : 'Any City'}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <MapPin className="h-5 w-5 text-accent" />
                <span>{(to && to !== 'all') ? to : 'Any City'}</span>
              </div>


              <div className="h-6 w-px bg-border hidden md:block" />

              {/* Date */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{date ? format(parseISO(date), 'PPP') : 'All upcoming dates'}</span>
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
                {isLoading ? 'Searching...' : (!from && !to && !date) ? `${trips.length} upcoming trips found across Nigeria` : `${trips.length} trips found`}
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
              {sortedTrips.map((trip: ApiTrip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🚌</div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {(!from && !to && !date) ? 'No upcoming trips available' : 'No trips found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {(!from && !to && !date) 
                  ? 'There are currently no scheduled trips. Please check back later.' 
                  : 'Try adjusting your search criteria or selecting a different date.'}
              </p>
              <Button variant="outline" onClick={() => window.history.back()}>
                {(!from && !to && !date) ? 'Go Back' : 'Modify Search'}
              </Button>
            </div>

          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
