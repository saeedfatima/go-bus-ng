import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
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
import { Ticket, Search, Filter, Eye, AlertTriangle, CheckCircle, XCircle, Clock, Ban, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ApiBooking } from '@/services/api/types';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';

const AdminBookings = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<ApiBooking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<BookingStatus>('pending');
  const [cancellationReason, setCancellationReason] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const result = await api.bookings.getAll();
      return result.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status, reason }: { bookingId: string; status: BookingStatus; reason?: string }) => {
      return await api.bookings.update(bookingId, { 
        status, 
        cancellationReason: reason 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking status updated successfully');
      setIsStatusDialogOpen(false);
      setIsDetailsOpen(false);
      setCancellationReason('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update booking status');
    }
  });

  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = 
      booking.passengerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.passengerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bookings?.length || 0,
    confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
    pending: bookings?.filter(b => b.status === 'pending').length || 0,
    cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
    expired: bookings?.filter(b => b.status === 'expired').length || 0,
  };

  const totalRevenue = bookings
    ?.filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + Number(b.totalAmount), 0) || 0;

  const openStatusDialog = (booking: ApiBooking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setCancellationReason(booking.cancellationReason || '');
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

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'expired': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-display">Booking Management</h1>
        <p className="text-muted-foreground">View and manage all system bookings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-bold text-green-500">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-bold text-red-500">{stats.cancelled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-2xl font-bold text-emerald-500">₦{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
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
            {filteredBookings?.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-mono">{booking.ticketCode}</TableCell>
                <TableCell>
                  <p className="font-medium">{booking.passengerName}</p>
                  <p className="text-xs text-muted-foreground">{booking.passengerPhone}</p>
                </TableCell>
                <TableCell>{booking.trip?.route?.originCity?.name} → {booking.trip?.route?.destinationCity?.name}</TableCell>
                <TableCell>{booking.trip?.company?.name || 'N/A'}</TableCell>
                <TableCell className="font-medium">₦{Number(booking.totalAmount).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeStyles(booking.status)}>{booking.status}</Badge>
                </TableCell>
                <TableCell>{format(new Date(booking.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedBooking(booking); setIsDetailsOpen(true); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openStatusDialog(booking)}>Update</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Ticket: {selectedBooking?.ticketCode}</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <span className="text-xs text-muted-foreground block">Passenger</span>
                  <span className="font-medium">{selectedBooking.passengerName}</span>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <span className="text-xs text-muted-foreground block">Phone</span>
                  <span className="font-medium">{selectedBooking.passengerPhone}</span>
                </div>
              </div>

              <div className="p-4 border rounded-xl bg-primary/5 border-primary/10">
                <p className="text-sm font-semibold mb-1">
                  {selectedBooking.trip?.route?.originCity?.name} → {selectedBooking.trip?.route?.destinationCity?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedBooking.trip?.departureTime || ''), 'MMMM d, yyyy @ h:mm a')}
                </p>
                <div className="mt-3 text-sm">
                  <p><span className="text-muted-foreground">Company:</span> {selectedBooking.trip?.company?.name}</p>
                  <p><span className="text-muted-foreground">Bus:</span> {selectedBooking.trip?.bus?.plateNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <span className="text-xs text-muted-foreground block">Seats</span>
                  <span className="font-medium">{selectedBooking.seats?.join(', ')}</span>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <span className="text-xs text-muted-foreground block">Amount</span>
                  <span className="font-bold text-lg text-primary">₦{Number(selectedBooking.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            <Button onClick={() => { setIsDetailsOpen(false); if (selectedBooking) openStatusDialog(selectedBooking); }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            {newStatus === 'cancelled' && (
              <Textarea
                placeholder="Reason for cancellation..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
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