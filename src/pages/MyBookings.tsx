import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { MapPin, Calendar, Clock, Ticket, ArrowRight, Loader2, Printer, Mail, Eye } from 'lucide-react';
import { toast } from 'sonner';

const MyBookings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
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
              company:companies(name, logo_url)
            )
          ),
          passengers:booking_passengers(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending Payment</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Cancelled</Badge>;
      case 'expired':
        return <Badge className="bg-muted text-muted-foreground border-muted">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSendEmail = async (bookingId: string) => {
    setSendingEmail(bookingId);
    try {
      const { data, error } = await supabase.functions.invoke('send-booking-email', {
        body: { bookingId },
      });

      if (error) throw error;

      toast.success('E-ticket sent to your email!');
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your trip bookings</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div key={booking.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Company Info */}
                      <div className="flex items-center gap-4 lg:w-48">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                          {booking.trip?.bus?.company?.logo_url || '🚌'}
                        </div>
                        <div>
                          <p className="font-semibold">{booking.trip?.bus?.company?.name || 'Unknown Company'}</p>
                          <p className="text-sm text-muted-foreground capitalize">{booking.trip?.bus?.bus_type}</p>
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">{booking.trip?.route?.origin_city?.name}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <MapPin className="h-4 w-4 text-accent" />
                          <span className="font-medium">{booking.trip?.route?.destination_city?.name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(booking.trip?.departure_time), 'PP')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(booking.trip?.departure_time), 'p')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Ticket className="h-4 w-4" />
                            <span>Seats: {booking.seats?.join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Amount */}
                      <div className="flex flex-col items-end gap-2 lg:w-32">
                        {getStatusBadge(booking.status)}
                        <p className="font-display text-lg font-bold text-primary">
                          ₦{Number(booking.total_amount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Ticket Code */}
                    <div className="mt-4 pt-4 border-t border-dashed border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Ticket Code:</span>
                        <span className="font-mono text-lg font-bold tracking-wider bg-muted px-3 py-1 rounded">
                          {booking.ticket_code}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Link to={`/booking/${booking.id}/confirmation`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </Link>
                        
                        {booking.status === 'confirmed' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => {
                                navigate(`/booking/${booking.id}/confirmation`);
                                setTimeout(() => window.print(), 500);
                              }}
                            >
                              <Printer className="h-4 w-4" />
                              Print
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleSendEmail(booking.id)}
                              disabled={sendingEmail === booking.id}
                            >
                              {sendingEmail === booking.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Mail className="h-4 w-4" />
                              )}
                              Email
                            </Button>
                          </>
                        )}

                        {booking.status === 'pending' && (
                          <Link to={`/booking/${booking.id}/payment`}>
                            <Button size="sm" className="gap-2">
                              Complete Payment
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Passengers (Collapsed by default) */}
                    {booking.passengers && booking.passengers.length > 0 && (
                      <details className="mt-4">
                        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                          View {booking.passengers.length} passenger(s)
                        </summary>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {booking.passengers.map((passenger: any) => (
                            <div key={passenger.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-sm">
                              <span className="flex items-center justify-center w-6 h-6 rounded bg-primary text-primary-foreground text-xs font-medium">
                                {passenger.seat_number}
                              </span>
                              <span className="font-medium">{passenger.full_name}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <Ticket className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
              <p className="text-muted-foreground mb-6">Start exploring trips and book your next journey</p>
              <Link to="/search">
                <Button size="lg">Find Trips</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;
