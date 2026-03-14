import { useOutletContext } from 'react-router-dom';
import { useBuses, useRoutes, useTrips, useBookings } from '@/hooks/useCompany';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Route, Calendar, Ticket, TrendingUp, Users } from 'lucide-react';
import { formatPrice } from '@/data/mockData';

interface DashboardContext {
  company: {
    id: string;
    name: string;
    isVerified: boolean;
  };
}

const Overview = () => {
  const { company } = useOutletContext<DashboardContext>();
  const { buses } = useBuses(company?.id);
  const { routes } = useRoutes(company?.id);
  const { trips } = useTrips(company?.id);
  const { bookings } = useBookings(company?.id);

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);

  const upcomingTrips = trips.filter(t => 
    t.status === 'scheduled' && new Date(t.departureTime) > new Date()
  ).length;

  const stats = [
    {
      title: 'Total Buses',
      value: buses.length,
      icon: Bus,
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'Active Routes',
      value: routes.filter(r => r.isActive).length,
      icon: Route,
      color: 'bg-green-500/10 text-green-500',
    },
    {
      title: 'Upcoming Trips',
      value: upcomingTrips,
      icon: Calendar,
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      title: 'Total Bookings',
      value: bookings.length,
      icon: Ticket,
      color: 'bg-orange-500/10 text-orange-500',
    },
    {
      title: 'Revenue',
      value: formatPrice(totalRevenue),
      icon: TrendingUp,
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      title: 'Passengers',
      value: bookings.reduce((sum, b) => sum + (Array.isArray(b.seats) ? b.seats.length : 0), 0),
      icon: Users,
      color: 'bg-pink-500/10 text-pink-500',
    },
  ];

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground">
        <h2 className="font-display text-2xl font-bold mb-2">
          Welcome back, {company?.name}!
        </h2>
        <p className="opacity-90">
          Here's an overview of your transport business performance.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No bookings yet. Start by adding buses, routes, and scheduling trips.
            </p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-foreground">{booking.passengerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.trip?.route?.originCity?.name} → {booking.trip?.route?.destinationCity?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatPrice(Number(booking.totalAmount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(booking.seats) ? booking.seats.length : 0} seat(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
