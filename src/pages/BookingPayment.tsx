import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Clock, MapPin, Users, CheckCircle, AlertTriangle, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInSeconds } from 'date-fns';
import { usePaystack } from '@/hooks/usePaystack';

const BookingPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isPaystackAvailable, initializePayment, verifyPayment, isInitializing } = usePaystack();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking-payment', id],
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
    enabled: !!id && !!user,
  });

  // Countdown timer
  useEffect(() => {
    if (!booking?.hold_expires_at) return;

    const updateTimer = () => {
      const expiresAt = new Date(booking.hold_expires_at);
      const now = new Date();
      const diff = differenceInSeconds(expiresAt, now);
      setTimeLeft(Math.max(0, diff));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [booking?.hold_expires_at]);

  // Handle expired bookings
  useEffect(() => {
    if (timeLeft === 0 && booking?.status === 'pending') {
      toast.error('Your booking has expired. Please try again.');
      navigate('/search');
    }
  }, [timeLeft, booking?.status, navigate]);

  // Handle Paystack callback (redirect back from Paystack)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference') || urlParams.get('trxref');
    
    if (reference && isPaystackAvailable) {
      const handlePaystackCallback = async () => {
        setIsProcessing(true);
        const result = await verifyPayment(reference);
        if (result && result.status === 'success') {
          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_completed_at: new Date().toISOString(),
            })
            .eq('id', id);

          queryClient.invalidateQueries({ queryKey: ['booking-payment', id] });
          queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
          toast.success('Payment successful! Your booking is confirmed.');
          navigate(`/booking/${id}/confirmation`, { replace: true });
        } else {
          toast.error('Payment verification failed. Please contact support.');
          setIsProcessing(false);
        }
      };
      handlePaystackCallback();
    }
  }, []);

  const confirmPayment = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);

      // Paystack flow for Django backend
      if (isPaystackAvailable && booking) {
        const result = await initializePayment(
          booking.id,
          booking.passenger_email,
          booking.total_amount
        );
        if (result) {
          // Redirect to Paystack checkout
          window.location.href = result.authorizationUrl;
          return false; // Don't proceed — page will redirect
        }
        throw new Error('Failed to initialize Paystack payment');
      }

      // Mock payment for Supabase backend
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_completed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    },
    onSuccess: (shouldNavigate) => {
      if (shouldNavigate === false) return; // Paystack redirect in progress
      queryClient.invalidateQueries({ queryKey: ['booking-payment', id] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Payment successful! Your booking is confirmed.');
      navigate(`/booking/${id}/confirmation`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    },
  });

  const cancelBooking = useMutation({
    mutationFn: async () => {
      // Release seats
      if (booking?.trip?.available_seats !== undefined && booking?.seats) {
        await supabase
          .from('trips')
          .update({ available_seats: booking.trip.available_seats + booking.seats.length })
          .eq('id', booking.trip_id);
      }

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Cancelled by user before payment',
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Booking cancelled. Seats have been released.');
      navigate('/search');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel booking');
    },
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || authLoading) {
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

  if (booking.status === 'confirmed') {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Booking Already Confirmed</h2>
            <p className="text-muted-foreground mb-4">This booking has already been paid for.</p>
            <Link to={`/booking/${id}/confirmation`}>
              <Button>View Confirmation</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (booking.status === 'cancelled' || booking.status === 'expired') {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Booking {booking.status}</h2>
            <p className="text-muted-foreground mb-4">This booking is no longer valid.</p>
            <Link to="/search">
              <Button>Search for Trips</Button>
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
        <div className="container py-8 max-w-4xl">
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to my bookings
          </Link>

          {/* Timer Warning */}
          {timeLeft !== null && timeLeft > 0 && (
            <div className={`flex items-center justify-between p-4 rounded-xl mb-6 ${
              timeLeft < 300 ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning-foreground'
            }`}>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Complete payment before time expires</span>
              </div>
              <span className="font-display text-2xl font-bold">{formatTime(timeLeft)}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Trip Details */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Trip Details</h2>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                  {booking.trip?.bus?.company?.logo_url || '🚌'}
                </div>
                <div>
                  <p className="font-medium">{booking.trip?.bus?.company?.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{booking.trip?.bus?.bus_type} Bus</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-medium">{booking.trip?.route?.origin_city?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-medium">{booking.trip?.route?.destination_city?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Departure</p>
                    <p className="font-medium">
                      {format(new Date(booking.trip?.departure_time), 'PPP')} at{' '}
                      {format(new Date(booking.trip?.departure_time), 'p')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <p className="font-medium">{booking.seats?.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Passengers</h2>

              <div className="space-y-3">
                {booking.passengers?.map((passenger: any, index: number) => (
                  <div key={passenger.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                      {passenger.seat_number}
                    </span>
                    <div>
                      <p className="font-medium">{passenger.full_name}</p>
                      <p className="text-sm text-muted-foreground">{passenger.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-card rounded-2xl border border-border p-6 mt-6">
            <h2 className="font-display text-lg font-semibold mb-4">Payment</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({booking.seats?.length} seats)</span>
                <span>₦{Number(booking.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span>₦0</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-3 border-t border-border">
                <span>Total</span>
                <span className="text-primary">₦{Number(booking.total_amount).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground text-center">
                {isPaystackAvailable
                  ? '🔒 Secure payment powered by Paystack'
                  : '🔒 This is a mock payment for testing. In production, this will integrate with Paystack.'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => cancelBooking.mutate()}
                disabled={cancelBooking.isPending || isProcessing}
              >
                {cancelBooking.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Booking'
                )}
              </Button>
              <Button
                className="flex-1"
                onClick={() => confirmPayment.mutate()}
                disabled={confirmPayment.isPending || isProcessing || isInitializing}
              >
                {isProcessing || isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isInitializing ? 'Connecting to Paystack...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ₦{Number(booking.total_amount).toLocaleString()}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPayment;
