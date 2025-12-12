import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useRoutes, useCities } from '@/hooks/useCompany';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Route, Trash2, ArrowRight, Clock, Banknote } from 'lucide-react';
import { formatPrice } from '@/data/mockData';

interface DashboardContext {
  company: {
    id: string;
    name: string;
  };
}

const RoutesPage = () => {
  const { company } = useOutletContext<DashboardContext>();
  const { routes, isLoading, addRoute, deleteRoute } = useRoutes(company?.id);
  const { cities } = useCities();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    origin_city_id: '',
    destination_city_id: '',
    base_price: 0,
    duration_hours: 0,
  });

  const resetForm = () => {
    setFormData({
      origin_city_id: '',
      destination_city_id: '',
      base_price: 0,
      duration_hours: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addRoute.mutateAsync(formData);
    setOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this route? This will also delete all associated trips.')) {
      await deleteRoute.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Manage Routes</h2>
          <p className="text-muted-foreground">Define routes between Nigerian cities</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Route</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Origin City</Label>
                <Select
                  value={formData.origin_city_id}
                  onValueChange={(value) => setFormData({ ...formData, origin_city_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}, {city.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Destination City</Label>
                <Select
                  value={formData.destination_city_id}
                  onValueChange={(value) => setFormData({ ...formData, destination_city_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities
                      .filter(city => city.id !== formData.origin_city_id)
                      .map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}, {city.state}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price">Base Price (₦)</Label>
                  <Input
                    id="base_price"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_hours">Duration (hours)</Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={addRoute.isPending}>
                  Add Route
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Route className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No routes yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Define your first route to start scheduling trips
            </p>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Route
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <Card key={route.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Route className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant={route.is_active ? 'default' : 'secondary'}>
                      {route.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(route.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Route cities */}
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{route.origin_city?.name}</p>
                      <p className="text-xs text-muted-foreground">{route.origin_city?.state}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{route.destination_city?.name}</p>
                      <p className="text-xs text-muted-foreground">{route.destination_city?.state}</p>
                    </div>
                  </div>

                  {/* Route details */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{route.duration_hours} hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {formatPrice(Number(route.base_price))}
                      </span>
                    </div>
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

export default RoutesPage;
