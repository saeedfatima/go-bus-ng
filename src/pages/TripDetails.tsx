import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBookTrip } from '@/hooks/useBookTrip';
import { Seat } from '@/types';
import { ArrowLeft, MapPin, Clock, Users, CheckCircle, Star, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Generate mock seats based on available seats
const generateSeats = (totalSeats: number, availableSeats: number): Seat[] => {
  const seats: Seat[] = [];
  const cols = 4;
  const rows = Math.ceil(totalSeats / cols);
  const bookedCount = totalSeats - availableSeats;
  const bookedIndices = new Set<number>();
  
  // Randomly mark some seats as booked
  while (bookedIndices.size < bookedCount) {
    bookedIndices.add(Math.floor(Math.random() * totalSeats));
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seatNum = row * cols + col + 1;
      if (seatNum <= totalSeats) {
        seats.push({
          id: `seat-${seatNum}`,
          number: seatNum.toString().padStart(2, '0'),
          row,
          column: col,
          isAvailable: !bookedIndices.has(seatNum - 1),
          isSelected: false,
          type: row < 2 ? 'premium' : 'standard',
        });
      }
    }
  }
  return seats;
};

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bookTrip = useBookTrip();
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerInfo, setPassengerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(
            *,
            origin_city:cities!routes_origin_city_id_fkey(name, state),
            destination_city:cities!routes_destination_city_id_fkey(name, state)
          ),
          bus:buses(
            *,
            company:companies(name, logo_url, rating, total_trips, is_verified)
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (trip?.bus?.total_seats) {
      setSeats(generateSeats(trip.bus.total_seats, trip.available_seats));
    }
  }, [trip]);

  useEffect(() => {
    if (user) {
      // Pre-fill with user data if available
      supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setPassengerInfo({
              name: data.full_name || '',
              email: user.email || '',
              phone: data.phone || '',
            });
          } else {
            setPassengerInfo(prev => ({
              ...prev,
              email: user.email || '',
            }));
          }
        });
    }
  }, [user]);

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || !seat.isAvailable) return;

    setSeats(prev =>
      prev.map(s =>
        s.id === seatId ? { ...s, isSelected: !s.isSelected } : s
      )
    );

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const totalPrice = selectedSeats.length * (trip?.price || 0);

  const handleProceed = async () => {
    if (!user) {
      toast.error('Please sign in to book a trip');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    if (!passengerInfo.name || !passengerInfo.email || !passengerInfo.phone) {
      toast.error('Please fill in all passenger details');
      return;
    }

    try {
      const seatNumbers = seats
        .filter(s => selectedSeats.includes(s.id))
        .map(s => s.number);

      await bookTrip.mutateAsync({
        tripId: id!,
        seats: seatNumbers,
        totalAmount: totalPrice,
        passengerName: passengerInfo.name,
        passengerEmail: passengerInfo.email,
        passengerPhone: passengerInfo.phone,
      });

      toast.success('Booking confirmed! Check your bookings for details.');
      navigate('/my-bookings');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete booking');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Trip not found</h2>
            <Link to="/search">
              <Button>Back to Search</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          {/* Back Link */}
          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search results
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Trip Info & Seat Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Summary Card */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      {trip.bus?.company?.logo_url || '🚌'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl font-bold">{trip.bus?.company?.name}</h2>
                        {trip.bus?.company?.is_verified && (
                          <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4 text-warning fill-warning" />
                        <span>{trip.bus?.company?.rating || 0}</span>
                        <span>•</span>
                        <span>{(trip.bus?.company?.total_trips || 0).toLocaleString()} trips</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                    {trip.bus?.bus_type}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="font-semibold">{trip.route?.origin_city?.name}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(trip.departure_time), 'p')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{trip.route?.duration_hours} hours</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(trip.departure_time), 'PPP')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">To</p>
                      <p className="font-semibold">{trip.route?.destination_city?.name}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(trip.arrival_time), 'p')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seat Selection */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Select Your Seats</h3>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-muted border-2 border-border" />
                    <span className="text-sm text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary" />
                    <span className="text-sm text-muted-foreground">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-destructive/20" />
                    <span className="text-sm text-muted-foreground">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 border-2 border-accent" />
                    <span className="text-sm text-muted-foreground">Premium</span>
                  </div>
                </div>

                {/* Bus Layout */}
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Driver Area */}
                    <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-border">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Driver
                      </div>
                    </div>

                    {/* Seats Grid */}
                    <div className="grid grid-cols-5 gap-2">
                      {seats.map((seat, index) => {
                        const isAfterAisle = seat.column === 2;

                        return (
                          <div key={seat.id} className="contents">
                            {isAfterAisle && (
                              <div key={`aisle-${index}`} className="w-4" />
                            )}
                            <button
                              onClick={() => handleSeatClick(seat.id)}
                              disabled={!seat.isAvailable}
                              className={cn(
                                "w-10 h-10 rounded-lg text-xs font-medium transition-all duration-200",
                                seat.isSelected
                                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                                  : seat.isAvailable
                                  ? seat.type === 'premium'
                                    ? "bg-accent/10 border-2 border-accent hover:bg-accent/20"
                                    : "bg-muted border-2 border-border hover:bg-muted/80 hover:border-primary/50"
                                  : "bg-destructive/20 text-destructive-foreground/50 cursor-not-allowed"
                              )}
                            >
                              {seat.number}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              {user && selectedSeats.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display text-lg font-semibold mb-4">Passenger Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={passengerInfo.name}
                        onChange={(e) => setPassengerInfo({ ...passengerInfo, name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={passengerInfo.email}
                        onChange={(e) => setPassengerInfo({ ...passengerInfo, email: e.target.value })}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={passengerInfo.phone}
                        onChange={(e) => setPassengerInfo({ ...passengerInfo, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Booking Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium">{trip.route?.origin_city?.name} → {trip.route?.destination_city?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{format(new Date(trip.departure_time), 'PPP')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{format(new Date(trip.departure_time), 'p')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seat(s)</span>
                    <span className="font-medium">
                      {selectedSeats.length > 0
                        ? seats
                            .filter(s => selectedSeats.includes(s.id))
                            .map(s => s.number)
                            .join(', ')
                        : 'None selected'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per seat</span>
                    <span className="font-medium">₦{trip.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-2xl font-bold text-primary">
                      ₦{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleProceed}
                  disabled={selectedSeats.length === 0 || bookTrip.isPending}
                >
                  {bookTrip.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : user ? (
                    'Confirm Booking'
                  ) : (
                    'Sign In to Book'
                  )}
                </Button>

                <div className="flex items-start gap-2 mt-4 p-3 bg-muted rounded-lg">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    You can cancel your booking up to 2 hours before departure for a full refund.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripDetails;
