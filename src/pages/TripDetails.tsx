import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { generateTrips, formatPrice, formatTime, formatDate } from '@/data/mockData';
import { Seat } from '@/types';
import { ArrowLeft, MapPin, Clock, Users, CheckCircle, Star, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Generate mock seats
const generateSeats = (totalSeats: number): Seat[] => {
  const seats: Seat[] = [];
  const cols = 4;
  const rows = Math.ceil(totalSeats / cols);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seatNum = row * cols + col + 1;
      if (seatNum <= totalSeats) {
        seats.push({
          id: `seat-${seatNum}`,
          number: seatNum.toString().padStart(2, '0'),
          row,
          column: col,
          isAvailable: Math.random() > 0.3,
          isSelected: false,
          type: row < 2 ? 'premium' : 'standard',
        });
      }
    }
  }
  return seats;
};

const TripDetails = () => {
  const { id } = useParams();
  const [seats, setSeats] = useState<Seat[]>(() => generateSeats(32));
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Mock trip data - in real app, fetch based on id
  const trips = generateTrips('Lagos', 'Abuja', new Date().toISOString().split('T')[0]);
  const trip = trips[0];

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || !seat.isAvailable) return;

    setSeats(prev =>
      prev.map(s =>
        s.id === seatId ? { ...s, isSelected: !s.isSelected } : s
      )
    );

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const totalPrice = selectedSeats.length * trip.price;

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    toast.success(`Proceeding with ${selectedSeats.length} seat(s). Total: ${formatPrice(totalPrice)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          {/* Back Link */}
          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search results
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Trip Info & Seat Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Summary Card */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{trip.company.logo}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl font-bold">{trip.company.name}</h2>
                        {trip.company.isVerified && (
                          <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4 text-warning fill-warning" />
                        <span>{trip.company.rating}</span>
                        <span>•</span>
                        <span>{trip.company.totalTrips.toLocaleString()} trips</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                    {trip.bus.busType}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="font-semibold">{trip.route.origin.name}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(trip.departureTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{trip.route.durationHours} hours</p>
                      <p className="text-sm text-muted-foreground">{formatDate(trip.departureTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">To</p>
                      <p className="font-semibold">{trip.route.destination.name}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(trip.arrivalTime)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seat Selection */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Select Your Seats</h3>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-muted border-2 border-border" />
                    <span className="text-sm text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary" />
                    <span className="text-sm text-muted-foreground">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-destructive/20" />
                    <span className="text-sm text-muted-foreground">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 border-2 border-accent" />
                    <span className="text-sm text-muted-foreground">Premium</span>
                  </div>
                </div>

                {/* Bus Layout */}
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Driver Area */}
                    <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-border">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Driver
                      </div>
                    </div>

                    {/* Seats Grid */}
                    <div className="grid grid-cols-5 gap-2">
                      {seats.map((seat, index) => {
                        // Add aisle gap after column 2
                        const isAfterAisle = seat.column === 2;

                        return (
                          <>
                            {isAfterAisle && (
                              <div key={`aisle-${index}`} className="w-4" />
                            )}
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat.id)}
                              disabled={!seat.isAvailable}
                              className={cn(
                                "w-10 h-10 rounded-lg text-xs font-medium transition-all duration-200",
                                seat.isSelected
                                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                                  : seat.isAvailable
                                  ? seat.type === 'premium'
                                    ? "bg-accent/10 border-2 border-accent hover:bg-accent/20"
                                    : "bg-muted border-2 border-border hover:bg-muted/80 hover:border-primary/50"
                                  : "bg-destructive/20 text-destructive-foreground/50 cursor-not-allowed"
                              )}
                            >
                              {seat.number}
                            </button>
                          </>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Booking Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium">{trip.route.origin.name} → {trip.route.destination.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(trip.departureTime)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{formatTime(trip.departureTime)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seat(s)</span>
                    <span className="font-medium">
                      {selectedSeats.length > 0
                        ? seats
                            .filter(s => selectedSeats.includes(s.id))
                            .map(s => s.number)
                            .join(', ')
                        : 'None selected'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per seat</span>
                    <span className="font-medium">{formatPrice(trip.price)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-2xl font-bold text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleProceed}
                  disabled={selectedSeats.length === 0}
                >
                  Proceed to Payment
                </Button>

                <div className="flex items-start gap-2 mt-4 p-3 bg-muted rounded-lg">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    You can cancel your booking up to 2 hours before departure for a full refund.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripDetails;
