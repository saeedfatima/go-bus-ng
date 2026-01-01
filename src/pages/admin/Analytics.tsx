import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, Ticket, Bus, Building2 } from 'lucide-react';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444'];

const AdminAnalytics = () => {
  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const [
        { data: bookings },
        { data: companies },
        { data: trips },
        { count: totalUsers }
      ] = await Promise.all([
        supabase
          .from('bookings')
          .select('created_at, total_amount, status')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('companies')
          .select('id, name, is_verified, created_at'),
        supabase
          .from('trips')
          .select('id, status, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      // Process daily revenue
      const days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
      });

      const dailyRevenue = days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayBookings = bookings?.filter(b => {
          const bookingDate = new Date(b.created_at);
          return bookingDate >= dayStart && bookingDate < dayEnd && b.status === 'confirmed';
        }) || [];

        const revenue = dayBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);

        return {
          date: format(day, 'EEE'),
          revenue,
          bookings: dayBookings.length
        };
      });

      // Booking status distribution
      const statusCounts = {
        confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
        pending: bookings?.filter(b => b.status === 'pending').length || 0,
        cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
        expired: bookings?.filter(b => b.status === 'expired').length || 0,
      };

      const statusData = [
        { name: 'Confirmed', value: statusCounts.confirmed },
        { name: 'Pending', value: statusCounts.pending },
        { name: 'Cancelled', value: statusCounts.cancelled },
        { name: 'Expired', value: statusCounts.expired },
      ].filter(d => d.value > 0);

      // Company stats
      const verifiedCompanies = companies?.filter(c => c.is_verified).length || 0;
      const unverifiedCompanies = (companies?.length || 0) - verifiedCompanies;

      // Total revenue
      const totalRevenue = bookings
        ?.filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;

      return {
        dailyRevenue,
        statusData,
        totalRevenue,
        totalBookings: bookings?.length || 0,
        totalUsers: totalUsers || 0,
        totalCompanies: companies?.length || 0,
        verifiedCompanies,
        unverifiedCompanies,
        totalTrips: trips?.length || 0,
        confirmedBookings: statusCounts.confirmed
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Analytics</h1>
        <p className="text-muted-foreground">Platform performance and insights (Last 30 days)</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{analytics?.totalRevenue?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {analytics?.confirmedBookings} confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Companies
            </CardTitle>
            <Building2 className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">{analytics?.verifiedCompanies} verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <Ticket className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Revenue (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Booking Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Booking Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics?.statusData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Bookings Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5" />
              Daily Bookings (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
