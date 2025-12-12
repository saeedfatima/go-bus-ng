import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBuses } from '@/hooks/useCompany';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Bus, Trash2, Edit, Wifi, Plug, Snowflake, Coffee } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface DashboardContext {
  company: {
    id: string;
    name: string;
  };
}

const amenityOptions = [
  { id: 'AC', label: 'Air Conditioning', icon: Snowflake },
  { id: 'WiFi', label: 'WiFi', icon: Wifi },
  { id: 'USB Charging', label: 'USB Charging', icon: Plug },
  { id: 'Snacks', label: 'Snacks & Drinks', icon: Coffee },
];

const Buses = () => {
  const { company } = useOutletContext<DashboardContext>();
  const { buses, isLoading, addBus, updateBus, deleteBus } = useBuses(company?.id);
  const [open, setOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<typeof buses[0] | null>(null);
  const [formData, setFormData] = useState({
    plate_number: '',
    bus_type: 'standard' as 'standard' | 'luxury' | 'executive',
    total_seats: 48,
    amenities: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      plate_number: '',
      bus_type: 'standard',
      total_seats: 48,
      amenities: [],
    });
    setEditingBus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBus) {
      await updateBus.mutateAsync({
        id: editingBus.id,
        ...formData,
      });
    } else {
      await addBus.mutateAsync(formData);
    }
    
    setOpen(false);
    resetForm();
  };

  const handleEdit = (bus: typeof buses[0]) => {
    setEditingBus(bus);
    setFormData({
      plate_number: bus.plate_number,
      bus_type: bus.bus_type,
      total_seats: bus.total_seats,
      amenities: bus.amenities || [],
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bus?')) {
      await deleteBus.mutateAsync(id);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
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
          <h2 className="font-display text-2xl font-bold text-foreground">Manage Buses</h2>
          <p className="text-muted-foreground">Add and manage your fleet of buses</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Bus
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plate_number">Plate Number</Label>
                <Input
                  id="plate_number"
                  placeholder="LAG-123-XY"
                  value={formData.plate_number}
                  onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bus Type</Label>
                  <Select
                    value={formData.bus_type}
                    onValueChange={(value: 'standard' | 'luxury' | 'executive') => 
                      setFormData({ ...formData, bus_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_seats">Total Seats</Label>
                  <Input
                    id="total_seats"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.total_seats}
                    onChange={(e) => setFormData({ ...formData, total_seats: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 gap-2">
                  {amenityOptions.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer"
                      onClick={() => toggleAmenity(amenity.id)}
                    >
                      <Checkbox
                        checked={formData.amenities.includes(amenity.id)}
                        onCheckedChange={() => toggleAmenity(amenity.id)}
                      />
                      <amenity.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={addBus.isPending || updateBus.isPending}>
                  {editingBus ? 'Update Bus' : 'Add Bus'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {buses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No buses yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first bus to start managing your fleet
            </p>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Bus
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buses.map((bus) => (
            <Card key={bus.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bus.plate_number}</CardTitle>
                      <Badge variant="secondary" className="capitalize mt-1">
                        {bus.bus_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(bus)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(bus.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Seats</span>
                    <span className="font-medium">{bus.total_seats}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={bus.is_active ? 'default' : 'secondary'}>
                      {bus.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {bus.amenities && bus.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
                      {bus.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Buses;
