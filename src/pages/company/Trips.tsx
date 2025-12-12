import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTrips, useRoutes, useBuses } from '@/hooks/useCompany';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, ArrowRight, Clock, Users, Banknote } from 'lucide-react';
import { formatPrice, formatTime, formatDate } from '@/data/mockData';

interface DashboardContext {
  company: {
    id: string;
    name: string;
  };
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500/10 text-blue-500',
  boarding: 'bg-yellow-500/10 text-yellow-500',
  departed: 'bg-purple-500/10 text-purple-500',
  arrived: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500',
};

const TripsPage = () => {
  const { company } = useOutletContext<DashboardContext>();
  const { trips, isLoading, addTrip, updateTrip } = useTrips(company?.id);
  const { routes } = useRoutes(company?.id);
  const { buses } = useBuses(company?.id);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    route_id: '',
    bus_id: '',
    departure_date: '',
    departure_time: '',
    price: 0,
    available_seats: 0,
  });

  const resetForm = () => {
    setFormData({
      route_id: '',
      bus_id: '',
      departure_date: '',
      departure_time: '',
      price: 0,
      available_seats: 0,
    });
  };

  const handleRouteChange = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setFormData(prev => ({
        ...prev,
        route_id: routeId,
        price: Number(route.base_price),
      }));
    }
  };

  const handleBusChange = (busId: string) => {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
      setFormData(prev => ({
        ...prev,
        bus_id: busId,
        available_seats: bus.total_seats,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const route = routes.find(r => r.id === formData.route_id);
    const departureDateTime = new Date(`${formData.departure_date}T${formData.departure_time}`);
    const arrivalDateTime = new Date(departureDateTime.getTime() + (route?.duration_hours || 0) * 60 * 60 * 1000);

    await addTrip.mutateAsync({
      route_id: formData.route_id,
      bus_id: formData.bus_id,
      departure_time: departureDateTime.toISOString(),
      arrival_time: arrivalDateTime.toISOString(),
      price: formData.price,
      available_seats: formData.available_seats,
    });
    
    setOpen(false);
    resetForm();
  };

  const handleStatusChange = async (tripId: string, status: string) => {
    await updateTrip.mutateAsync({
      id: tripId,
      status: status as 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeRoutes = routes.filter(r => r.is_active);
  const activeBuses = buses.filter(b => b.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Trip Schedules</h2>
          <p className="text-muted-foreground">Schedule and manage your trips</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={activeRoutes.length === 0 || activeBuses.length === 0}>
              <Plus className="h-4 w-4" />
              Schedule Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Trip</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Route</Label>
                <Select
                  value={formData.route_id}
                  onValueChange={handleRouteChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeRoutes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.origin_city?.name} → {route.destination_city?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bus</Label>
                <Select
                  value={formData.bus_id}
                  onValueChange={handleBusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBuses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.plate_number} ({bus.bus_type} - {bus.total_seats} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure_date">Departure Date</Label>
                  <Input
                    id="departure_date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.departure_date}
                    onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departure_time">Departure Time</Label>
                  <Input
                    id="departure_time"
                    type="time"
                    value={formData.departure_time}
                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available_seats">Available Seats</Label>
                  <Input
                    id="available_seats"
                    type="number"
                    min="1"
                    value={formData.available_seats}
                    onChange={(e) => setFormData({ ...formData, available_seats: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={addTrip.isPending}>
                  Schedule Trip
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {activeRoutes.length === 0 || activeBuses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Setup required</h3>
            <p className="text-muted-foreground text-center mb-4">
              {activeRoutes.length === 0 
                ? 'Add at least one route before scheduling trips'
                : 'Add at least one bus before scheduling trips'}
            </p>
          </CardContent>
        </Card>
      ) : trips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No trips scheduled</h3>
            <p className="text-muted-foreground text-center mb-4">
              Schedule your first trip to start accepting bookings
            </p>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Your First Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <Card key={trip.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Route info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={statusColors[trip.status]}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {trip.bus?.plate_number} • {trip.bus?.bus_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{trip.route?.origin_city?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(trip.departure_time)}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-foreground">{trip.route?.destination_city?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(trip.arrival_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trip details */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(trip.departure_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{trip.available_seats} seats left</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{formatPrice(Number(trip.price))}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={trip.status}
                      onValueChange={(value) => handleStatusChange(trip.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="boarding">Boarding</SelectItem>
                        <SelectItem value="departed">Departed</SelectItem>
                        <SelectItem value="arrived">Arrived</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripsPage;
