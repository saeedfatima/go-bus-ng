import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Ticket, Bus, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { ApiBooking } from '@/services/api/types';

const AdminOverview = () => {
  // Fetch all statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        usersResult,
        companiesResult,
        bookingsResult,
        tripsResult
      ] = await Promise.all([
        api.profiles.getAll(),
        api.companies.getAll(),
        api.bookings.getAll(),
        api.trips.search({})
      ]);

      const totalRevenue = bookingsResult.data
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + Number(b.totalAmount), 0);
      
      const today = startOfDay(new Date());
      const todayBookings = bookingsResult.data.filter(b => 
        startOfDay(new Date(b.createdAt)).getTime() === today.getTime()
      ).length;

      return {
        totalUsers: usersResult.total || usersResult.data.length,
        totalCompanies: companiesResult.total || companiesResult.data.length,
        totalBookings: bookingsResult.total || bookingsResult.data.length,
        totalTrips: tripsResult.length,
        totalRevenue,
        todayBookings
      };
    }
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery<ApiBooking[]>({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      const result = await api.bookings.getAll({ limit: 5 });
      return result.data;
    }
  });

  if (isLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-500' },
    { title: 'Companies', value: stats?.totalCompanies, icon: Building2, color: 'text-purple-500' },
    { title: 'Total Bookings', value: stats?.totalBookings, icon: Ticket, color: 'text-green-500' },
    { title: 'Total Trips', value: stats?.totalTrips, icon: Bus, color: 'text-orange-500' },
    { title: 'Total Revenue', value: `₦${stats?.totalRevenue?.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500' },
    { title: 'Today\'s Bookings', value: stats?.todayBookings, icon: Calendar, color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Dashboard Overview</h1>
        <p className="text-muted-foreground">Key metrics and recent activity across the platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-muted/50`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentActivity?.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary`}>
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{booking.passengerName || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">
                      Booking #{booking.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">₦{Number(booking.totalAmount).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(booking.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
            {!recentActivity?.length && (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                No recent bookings found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
