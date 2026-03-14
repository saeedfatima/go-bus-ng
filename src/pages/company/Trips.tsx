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
    routeId: '',
    busId: '',
    departureDate: '',
    departureTime: '',
    price: 0,
    availableSeats: 0,
  });

  const resetForm = () => {
    setFormData({
      routeId: '',
      busId: '',
      departureDate: '',
      departureTime: '',
      price: 0,
      availableSeats: 0,
    });
  };

  const handleRouteChange = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setFormData(prev => ({
        ...prev,
        routeId: routeId,
        price: Number(route.basePrice),
      }));
    }
  };

  const handleBusChange = (busId: string) => {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
      setFormData(prev => ({
        ...prev,
        busId: busId,
        availableSeats: bus.totalSeats,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const route = routes.find(r => r.id === formData.routeId);
    const departureDateTime = new Date(`${formData.departureDate}T${formData.departureTime}`);
    const arrivalDateTime = new Date(departureDateTime.getTime() + (route?.durationHours || 0) * 60 * 60 * 1000);

    await addTrip.mutateAsync({
      routeId: formData.routeId,
      busId: formData.busId,
      departureTime: departureDateTime.toISOString(),
      arrivalTime: arrivalDateTime.toISOString(),
      price: formData.price,
      availableSeats: formData.availableSeats,
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

  const activeRoutes = routes.filter(r => r.isActive);
  const activeBuses = buses.filter(b => b.isActive);

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
                  value={formData.routeId}
                  onValueChange={handleRouteChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeRoutes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.originCity?.name} → {route.destinationCity?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bus</Label>
                <Select
                  value={formData.busId}
                  onValueChange={handleBusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBuses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.plateNumber} ({bus.busType} - {bus.totalSeats} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureDate">Departure Date</Label>
                  <Input
                    id="departureDate"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <Input
                    id="departureTime"
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
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
                  <Label htmlFor="availableSeats">Available Seats</Label>
                  <Input
                    id="availableSeats"
                    type="number"
                    min="1"
                    value={formData.availableSeats}
                    onChange={(e) => setFormData({ ...formData, availableSeats: parseInt(e.target.value) })}
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
                        {trip.bus?.plateNumber} • {trip.bus?.busType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{trip.route?.originCity?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(trip.departureTime)}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-foreground">{trip.route?.destinationCity?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(trip.arrivalTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trip details */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(trip.departureTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{trip.availableSeats} seats left</span>
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
