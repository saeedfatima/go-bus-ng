import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, Ticket, Bus, Building2, Loader2 } from 'lucide-react';
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
        bookingsResult,
        companiesResult,
        tripsResult,
        usersResult
      ] = await Promise.all([
        api.bookings.getAll(),
        api.companies.getAll(),
        api.trips.search({}), // Generic search
        api.profiles.getAll()
      ]);

      const bookings = bookingsResult.data;
      const companies = companiesResult.data;

      // Process daily revenue
      const days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
      });

      const dailyRevenue = days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayBookings = bookings.filter(b => {
          const bookingDate = new Date(b.createdAt);
          return bookingDate >= dayStart && bookingDate < dayEnd && b.status === 'confirmed';
        });

        const revenue = dayBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);

        return {
          date: format(day, 'EEE'),
          revenue,
          bookings: dayBookings.length
        };
      });

      // Booking status distribution
      const statusCounts = {
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        expired: bookings.filter(b => b.status === 'expired').length,
      };

      const statusData = [
        { name: 'Confirmed', value: statusCounts.confirmed },
        { name: 'Pending', value: statusCounts.pending },
        { name: 'Cancelled', value: statusCounts.cancelled },
        { name: 'Expired', value: statusCounts.expired },
      ].filter(d => d.value > 0);

      // Company stats
      const verifiedCompanies = companies.filter(c => c.isVerified).length;

      // Total revenue
      const totalRevenue = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + Number(b.totalAmount), 0);

      return {
        dailyRevenue,
        statusData,
        totalRevenue,
        totalBookings: bookings.length,
        totalUsers: usersResult.total || usersResult.data.length,
        totalCompanies: companies.length,
        verifiedCompanies,
        totalTrips: tripsResult.length,
        confirmedBookings: statusCounts.confirmed
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">System Analytics</h1>
        <p className="text-muted-foreground">Platform performance and insights (Last 30 days)</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
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

        <Card className="hover:shadow-md transition-shadow">
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

        <Card className="hover:shadow-md transition-shadow">
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

        <Card className="hover:shadow-md transition-shadow">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <TrendingUp className="h-5 w-5 text-primary" />
              Daily Revenue (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="date" className="text-xs" axisLine={false} tickLine={false} />
                  <YAxis className="text-xs" axisLine={false} tickLine={false} tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/.5)'}}
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Ticket className="h-5 w-5 text-primary" />
              Booking Distribution
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
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {analytics?.statusData?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
