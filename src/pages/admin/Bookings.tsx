import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Ticket, Search, Filter, Eye, AlertTriangle, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';

interface Booking {
  id: string;
  ticket_code: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  total_amount: number;
  status: BookingStatus;
  seats: string[];
  created_at: string;
  cancellation_reason: string | null;
  trips: {
    departure_time: string;
    arrival_time: string;
    price: number;
    routes: {
      origin_city: { name: string };
      destination_city: { name: string };
    };
    buses: {
      plate_number: string;
      companies: { name: string };
    };
  };
}

const AdminBookings = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<BookingStatus>('pending');
  const [cancellationReason, setCancellationReason] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trips (
            departure_time,
            arrival_time,
            price,
            routes (
              origin_city:cities!routes_origin_city_id_fkey(name),
              destination_city:cities!routes_destination_city_id_fkey(name)
            ),
            buses (
              plate_number,
              companies (name)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Booking[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status, reason }: { bookingId: string; status: BookingStatus; reason?: string }) => {
      const updateData: any = { status };
      
      if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancellation_reason = reason || 'Cancelled by admin';
      } else if (status === 'confirmed') {
        updateData.payment_completed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking status updated successfully');
      setIsStatusDialogOpen(false);
      setIsDetailsOpen(false);
      setCancellationReason('');
    },
    onError: () => {
      toast.error('Failed to update booking status');
    }
  });

  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = 
      booking.passenger_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.passenger_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.ticket_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'confirmed': 
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': 
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'cancelled': 
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'expired': 
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: 
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'pending': return Clock;
      case 'cancelled': return XCircle;
      case 'expired': return Ban;
      default: return AlertTriangle;
    }
  };

  const stats = {
    total: bookings?.length || 0,
    confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
    pending: bookings?.filter(b => b.status === 'pending').length || 0,
    cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
    expired: bookings?.filter(b => b.status === 'expired').length || 0,
  };

  const totalRevenue = bookings
    ?.filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;

  const openStatusDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setCancellationReason('');
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (selectedBooking) {
      updateStatusMutation.mutate({
        bookingId: selectedBooking.id,
        status: newStatus,
        reason: cancellationReason
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground">View and manage all system bookings, resolve issues</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Ticket className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold text-green-500">{stats.confirmed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-red-500">{stats.cancelled}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold text-emerald-500">₦{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ticket code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({filteredBookings?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket Code</TableHead>
                <TableHead>Passenger</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings?.map((booking) => {
                const StatusIcon = getStatusIcon(booking.status);
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono font-medium">
                      {booking.ticket_code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.passenger_name}</p>
                        <p className="text-sm text-muted-foreground">{booking.passenger_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.trips?.routes?.origin_city?.name} → {booking.trips?.routes?.destination_city?.name}
                    </TableCell>
                    <TableCell>
                      {booking.trips?.buses?.companies?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₦{Number(booking.total_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeStyles(booking.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStatusDialog(booking)}
                        >
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredBookings?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Booking Details
            </DialogTitle>
            <DialogDescription>
              Ticket: {selectedBooking?.ticket_code}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={getStatusBadgeStyles(selectedBooking.status)}>
                  {selectedBooking.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Passenger</p>
                  <p className="font-medium">{selectedBooking.passenger_name}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedBooking.passenger_phone}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg col-span-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedBooking.passenger_email}</p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">Trip Details</p>
                <p className="font-medium">
                  {selectedBooking.trips?.routes?.origin_city?.name} → {selectedBooking.trips?.routes?.destination_city?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedBooking.trips?.departure_time), 'MMM d, yyyy h:mm a')}
                </p>
                <p className="text-sm mt-2">
                  Company: <span className="font-medium">{selectedBooking.trips?.buses?.companies?.name}</span>
                </p>
                <p className="text-sm">
                  Bus: <span className="font-medium">{selectedBooking.trips?.buses?.plate_number}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Seats</p>
                  <p className="font-medium">{selectedBooking.seats?.join(', ')}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-lg text-primary">₦{Number(selectedBooking.total_amount).toLocaleString()}</p>
                </div>
              </div>

              {selectedBooking.cancellation_reason && (
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-sm text-red-500 font-medium">Cancellation Reason</p>
                  <p className="text-sm mt-1">{selectedBooking.cancellation_reason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsDetailsOpen(false);
              if (selectedBooking) openStatusDialog(selectedBooking);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Change the status for booking {selectedBooking?.ticket_code}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={(v: BookingStatus) => setNewStatus(v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="confirmed">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Confirmed
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Cancelled
                    </div>
                  </SelectItem>
                  <SelectItem value="expired">
                    <div className="flex items-center gap-2">
                      <Ban className="h-4 w-4 text-gray-500" />
                      Expired
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'cancelled' && (
              <div>
                <label className="text-sm font-medium">Cancellation Reason</label>
                <Textarea
                  placeholder="Enter reason for cancellation..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            {newStatus === 'confirmed' && selectedBooking?.status === 'pending' && (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm text-green-600">
                  Confirming this booking will mark payment as completed.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updateStatusMutation.isPending || (newStatus === 'cancelled' && !cancellationReason)}
            >
              {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;