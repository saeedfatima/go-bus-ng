import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, MapPin, Clock, Users, Download, Calendar, Loader2 } from 'lucide-react';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';

const BookingConfirmation = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking-confirmation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trip:trips(
            *,
            route:routes(
              *,
              origin_city:cities!routes_origin_city_id_fkey(name, state),
              destination_city:cities!routes_destination_city_id_fkey(name, state)
            ),
            bus:buses(
              *,
              company:companies(name, logo_url, is_verified)
            )
          ),
          passengers:booking_passengers(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getDepartureCountdown = () => {
    if (!booking?.trip?.departure_time) return null;
    const departure = new Date(booking.trip.departure_time);
    const now = new Date();
    const hours = differenceInHours(departure, now);
    const minutes = differenceInMinutes(departure, now) % 60;
    
    if (hours < 0) return 'Departed';
    if (hours === 0) return `${minutes} minutes`;
    return `${hours}h ${minutes}m`;
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

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Booking not found</h2>
            <Link to="/my-bookings">
              <Button>View My Bookings</Button>
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
        <div className="container py-8 max-w-3xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your tickets have been booked successfully. Reference: <span className="font-mono font-bold text-foreground">{booking.ticket_code}</span>
            </p>
          </div>

          {/* Departure Countdown */}
          {getDepartureCountdown() && getDepartureCountdown() !== 'Departed' && (
            <div className="bg-primary/10 rounded-2xl p-6 mb-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Time until departure</p>
              <p className="font-display text-3xl font-bold text-primary">{getDepartureCountdown()}</p>
            </div>
          )}

          {/* Ticket Card */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-primary p-4 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl">
                    {booking.trip?.bus?.company?.logo_url || '🚌'}
                  </div>
                  <div>
                    <p className="font-semibold">{booking.trip?.bus?.company?.name}</p>
                    <p className="text-sm opacity-80 capitalize">{booking.trip?.bus?.bus_type} Bus</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {booking.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Route */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{booking.trip?.route?.origin_city?.name}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(booking.trip?.departure_time), 'p')}</p>
                </div>
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="flex-1 h-px bg-border" />
                  <MapPin className="h-5 w-5 mx-2 text-primary" />
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{booking.trip?.route?.destination_city?.name}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(booking.trip?.arrival_time), 'p')}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-dashed border-border">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Date</span>
                  </div>
                  <p className="font-medium">{format(new Date(booking.trip?.departure_time), 'PP')}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Duration</span>
                  </div>
                  <p className="font-medium">{booking.trip?.route?.duration_hours}h</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Seats</span>
                  </div>
                  <p className="font-medium">{booking.seats?.join(', ')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                  <p className="font-display text-lg font-bold text-primary">₦{Number(booking.total_amount).toLocaleString()}</p>
                </div>
              </div>

              {/* Passengers */}
              <div className="mt-4">
                <h3 className="font-medium mb-3">Passengers</h3>
                <div className="space-y-2">
                  {booking.passengers?.map((passenger: any) => (
                    <div key={passenger.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                      <span className="flex items-center justify-center w-7 h-7 rounded bg-primary text-primary-foreground text-xs font-medium">
                        {passenger.seat_number}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{passenger.full_name}</p>
                        <p className="text-xs text-muted-foreground">{passenger.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticket Code */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                <p className="font-mono text-2xl font-bold tracking-wider">{booking.ticket_code}</p>
                <p className="text-xs text-muted-foreground mt-2">Show this code when boarding</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1" disabled>
              <Download className="h-4 w-4 mr-2" />
              Download E-Ticket (Coming Soon)
            </Button>
            <Link to="/my-bookings" className="flex-1">
              <Button className="w-full">View All Bookings</Button>
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
            <p>Need help? Contact our support team</p>
            <p className="font-medium text-foreground">support@nigeriabus.com • +234 800 123 4567</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;
