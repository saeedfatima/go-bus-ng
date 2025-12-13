import { Clock, Users, Wifi, Plug, Cookie, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TripCardProps {
  trip: any;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'AC': () => <span className="text-xs">❄️</span>,
  'WiFi': Wifi,
  'USB Charging': Plug,
  'Snacks': Cookie,
};

const busTypeStyles: Record<string, string> = {
  standard: 'bg-secondary text-secondary-foreground',
  luxury: 'bg-accent/10 text-accent',
  executive: 'bg-primary/10 text-primary',
};

const TripCard = ({ trip }: TripCardProps) => {
  const departureTime = format(new Date(trip.departure_time), 'p');
  const arrivalTime = format(new Date(trip.arrival_time), 'p');
  const company = trip.route?.company || trip.bus?.company;

  return (
    <div className="group bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Company Info */}
          <div className="flex items-center gap-3 lg:w-48">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
              {company?.logo_url || '🚌'}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-foreground">{company?.name || 'Unknown'}</h3>
                {company?.is_verified && (
                  <CheckCircle className="h-4 w-4 text-primary fill-primary/20" />
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3 w-3 text-warning fill-warning" />
                <span>{company?.rating || 0}</span>
              </div>
            </div>
          </div>

          {/* Time & Route */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-foreground">{departureTime}</p>
                <p className="text-sm text-muted-foreground">{trip.route?.origin_city?.name}</p>
              </div>

              <div className="flex-1 flex items-center gap-2">
                <div className="h-px flex-1 bg-border relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent" />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Clock className="h-3 w-3" />
                  <span>{trip.route?.duration_hours}h</span>
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="text-center">
                <p className="font-display text-2xl font-bold text-foreground">{arrivalTime}</p>
                <p className="text-sm text-muted-foreground">{trip.route?.destination_city?.name}</p>
              </div>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center gap-4 lg:flex-col lg:items-end lg:gap-2">
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-primary">₦{trip.price?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">per seat</p>
            </div>
            <Link to={`/trip/${trip.id}`}>
              <Button className="gap-2">Select Seat</Button>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border">
          <span className={cn(
            "px-2 py-1 rounded-md text-xs font-medium capitalize",
            busTypeStyles[trip.bus?.bus_type] || busTypeStyles.standard
          )}>
            {trip.bus?.bus_type || 'standard'}
          </span>

          <div className="flex items-center gap-2">
            {(trip.bus?.amenities || []).map((amenity: string) => {
              const Icon = amenityIcons[amenity];
              return Icon ? (
                <span key={amenity} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground" title={amenity}>
                  <Icon className="h-3 w-3" />
                  {amenity}
                </span>
              ) : null;
            })}
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
            <Users className="h-4 w-4" />
            <span>{trip.available_seats} seats left</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
