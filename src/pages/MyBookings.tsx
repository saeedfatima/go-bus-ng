import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { MapPin, Calendar, Clock, Ticket, ArrowRight, Loader2 } from 'lucide-react';

const MyBookings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
          )
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
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
                <div key={booking.id} className="bg-card rounded-2xl border border-border p-6">
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
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(booking.trip?.departure_time), 'PPP')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(booking.trip?.departure_time), 'p')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Ticket className="h-4 w-4" />
                          Seats: {booking.seats?.join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Status & Price */}
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(booking.status)}
                      <p className="font-display text-xl font-bold text-primary">
                        ₦{booking.total_amount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{booking.ticket_code}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="font-display text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your journey by booking your first trip!
              </p>
              <Link to="/search">
                <Button>Find Trips</Button>
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