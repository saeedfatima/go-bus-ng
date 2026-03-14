import { Button } from '@/components/ui/button';
import { Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ApiTrip } from '@/services/api/types';

interface BookingSummaryProps {
  trip: ApiTrip;
  selectedSeats: string[];
  seatNumbers: string[];
  totalPrice: number;
  onProceed: () => void;
  isPending: boolean;
  isAuthenticated: boolean;
}


const BookingSummary = ({
  trip,
  selectedSeats,
  seatNumbers,
  totalPrice,
  onProceed,
  isPending,
  isAuthenticated,
}: BookingSummaryProps) => {
  return (
    <div className="sticky top-24 bg-card rounded-2xl border border-border p-6">
      <h3 className="font-display text-lg font-semibold mb-4">Booking Summary</h3>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Route</span>
          <span className="font-medium">
            {trip.route?.originCity?.name} → {trip.route?.destinationCity?.name}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Date</span>
          <span className="font-medium">{format(new Date(trip.departureTime), 'PPP')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Time</span>
          <span className="font-medium">{format(new Date(trip.departureTime), 'p')}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Seat(s)</span>
          <span className="font-medium">
            {seatNumbers.length > 0 ? seatNumbers.join(', ') : 'None selected'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Price per seat</span>
          <span className="font-medium">₦{trip.price.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Number of passengers</span>
          <span className="font-medium">{selectedSeats.length}</span>
        </div>
      </div>

      <div className="border-t border-border pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="font-display text-2xl font-bold text-primary">
            ₦{totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 text-warning-foreground rounded-lg mb-4 text-sm">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>Seats will be held for 2 hours after booking initiation</span>
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={onProceed}
        disabled={selectedSeats.length === 0 || isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : !isAuthenticated ? (
          'Sign in to Book'
        ) : (
          `Proceed to Payment • ₦${totalPrice.toLocaleString()}`
        )}
      </Button>

      {!isAuthenticated && selectedSeats.length > 0 && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          You'll be redirected to sign in before completing your booking
        </p>
      )}
    </div>
  );
};

export default BookingSummary;
