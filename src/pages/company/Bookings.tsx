import { useOutletContext } from 'react-router-dom';
import { useBookings } from '@/hooks/useCompany';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, ArrowRight, Calendar, Phone, Mail } from 'lucide-react';
import { formatPrice, formatTime, formatDate } from '@/data/mockData';

interface DashboardContext {
  company: {
    id: string;
    name: string;
  };
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  confirmed: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500',
};

const BookingsPage = () => {
  const { company } = useOutletContext<DashboardContext>();
  const { bookings, isLoading } = useBookings(company?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Bookings</h2>
        <p className="text-muted-foreground">View all bookings for your trips</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No bookings yet</h3>
            <p className="text-muted-foreground text-center">
              Bookings will appear here when passengers book your trips
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Booking info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[booking.status]}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      <span className="font-mono text-sm text-muted-foreground">
                        {booking.ticketCode}
                      </span>
                    </div>

                    {/* Passenger details */}
                    <div>
                      <p className="font-semibold text-lg text-foreground">{booking.passengerName}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {booking.passengerPhone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {booking.passengerEmail}
                        </div>
                      </div>
                    </div>

                    {/* Trip details */}
                    {booking.trip && (
                      <div className="flex items-center gap-4 pt-3 border-t border-border">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {booking.trip.route?.originCity?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(booking.trip.departureTime)}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">
                              {booking.trip.route?.destinationCity?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(booking.trip.arrivalTime)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(booking.trip.departureTime)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking summary */}
                  <div className="lg:text-right space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Seats</p>
                      <p className="font-medium">{booking.seats.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold text-foreground">
                        {formatPrice(Number(booking.totalAmount))}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
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

export default BookingsPage;
