import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Ticket, Bus, TrendingUp, Calendar } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

const AdminOverview = () => {
  // Fetch all statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalCompanies },
        { count: totalBookings },
        { count: totalTrips },
        { data: recentBookings },
        { data: revenueData }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('trips').select('*', { count: 'exact', head: true }),
        supabase.from('bookings')
          .select('created_at, status')
          .gte('created_at', subDays(new Date(), 7).toISOString())
          .order('created_at', { ascending: false }),
        supabase.from('bookings')
          .select('total_amount, status')
          .eq('status', 'confirmed')
      ]);

      const totalRevenue = revenueData?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
      const todayBookings = recentBookings?.filter(b => 
        startOfDay(new Date(b.created_at)).getTime() === startOfDay(new Date()).getTime()
      ).length || 0;

      return {
        totalUsers: totalUsers || 0,
        totalCompanies: totalCompanies || 0,
        totalBookings: totalBookings || 0,
        totalTrips: totalTrips || 0,
        totalRevenue,
        todayBookings,
        weeklyBookings: recentBookings?.length || 0
      };
    }
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          passenger_name,
          total_amount,
          status,
          created_at,
          trips (
            routes (
              origin_city:cities!routes_origin_city_id_fkey(name),
              destination_city:cities!routes_destination_city_id_fkey(name)
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      return bookings || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to the admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity?.map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{booking.passenger_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.trips?.routes?.origin_city?.name} → {booking.trips?.routes?.destination_city?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₦{Number(booking.total_amount).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(booking.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
            {!recentActivity?.length && (
              <p className="text-muted-foreground text-center py-4">No recent bookings</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
