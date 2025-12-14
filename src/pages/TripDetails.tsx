import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiPassengerBooking } from '@/hooks/useMultiPassengerBooking';
import PassengerForm from '@/components/booking/PassengerForm';
import BookingSummary from '@/components/booking/BookingSummary';
import { Seat } from '@/types';
import { ArrowLeft, MapPin, Clock, Users, CheckCircle, Star, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PassengerFormData {
  fullName: string;
  phone: string;
  email: string;
  nin: string;
  seatNumber: string;
}

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
  const bookTrip = useMultiPassengerBooking();
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerFormData[]>([]);

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

  // Sync passengers with selected seats
  useEffect(() => {
    const seatNumbers = seats
      .filter(s => selectedSeats.includes(s.id))
      .map(s => s.number);

    setPassengers(prev => {
      const newPassengers = seatNumbers.map((seatNum, idx) => {
        const existing = prev.find(p => p.seatNumber === seatNum);
        if (existing) return existing;
        
        // Pre-fill first passenger with user data
        if (idx === 0 && user) {
          return {
            fullName: '',
            phone: '',
            email: user.email || '',
            nin: '',
            seatNumber: seatNum,
          };
        }
        
        return {
          fullName: '',
          phone: '',
          email: '',
          nin: '',
          seatNumber: seatNum,
        };
      });
      return newPassengers;
    });
  }, [selectedSeats, seats, user]);

  // Pre-fill first passenger with profile data
  useEffect(() => {
    if (user && passengers.length > 0) {
      supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setPassengers(prev => {
              if (prev.length === 0) return prev;
              const updated = [...prev];
              if (!updated[0].fullName && data.full_name) {
                updated[0] = { ...updated[0], fullName: data.full_name };
              }
              if (!updated[0].phone && data.phone) {
                updated[0] = { ...updated[0], phone: data.phone };
              }
              return updated;
            });
          }
        });
    }
  }, [user, passengers.length]);

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

  const handlePassengerChange = (index: number, field: keyof PassengerFormData, value: string) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveSeat = (index: number) => {
    const passenger = passengers[index];
    const seatId = seats.find(s => s.number === passenger.seatNumber)?.id;
    if (seatId) {
      handleSeatClick(seatId);
    }
  };

  const totalPrice = selectedSeats.length * (trip?.price || 0);
  const seatNumbers = seats.filter(s => selectedSeats.includes(s.id)).map(s => s.number);

  const handleProceed = async () => {
    if (!user) {
      // Store booking intent and redirect to login
      sessionStorage.setItem('bookingIntent', JSON.stringify({
        tripId: id,
        selectedSeats,
        returnUrl: `/trip/${id}`,
      }));
      toast.info('Please sign in to complete your booking');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    // Validate all passengers have required fields
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.fullName.trim()) {
        toast.error(`Please enter the full name for passenger ${i + 1}`);
        return;
      }
      if (!p.phone.trim()) {
        toast.error(`Please enter the phone number for passenger ${i + 1}`);
        return;
      }
    }

    try {
      const result = await bookTrip.mutateAsync({
        tripId: id!,
        passengers,
        totalAmount: totalPrice,
      });

      toast.success(`Booking initiated! Complete payment within ${result.holdMinutes} minutes.`);
      navigate(`/booking/${result.booking.id}/payment`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate booking');
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

              {/* Passenger Details - Multi-passenger */}
              {selectedSeats.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold">Passenger Details</h3>
                    <span className="text-sm text-muted-foreground">
                      {passengers.length} passenger{passengers.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {!user && (
                    <div className="flex items-center gap-2 p-4 bg-primary/10 text-primary rounded-lg mb-4">
                      <Info className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">
                        Please sign in to fill in passenger details and complete your booking.
                      </p>
                    </div>
                  )}

                  {user && (
                    <div className="space-y-4">
                      {passengers.map((passenger, index) => (
                        <PassengerForm
                          key={passenger.seatNumber}
                          index={index}
                          passenger={passenger}
                          seatNumber={passenger.seatNumber}
                          onChange={handlePassengerChange}
                          onRemove={handleRemoveSeat}
                          showRemove={passengers.length > 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <BookingSummary
                trip={trip}
                selectedSeats={selectedSeats}
                seatNumbers={seatNumbers}
                totalPrice={totalPrice}
                onProceed={handleProceed}
                isPending={bookTrip.isPending}
                isAuthenticated={!!user}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripDetails;
