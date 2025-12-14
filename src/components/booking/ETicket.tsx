import { forwardRef } from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar, Clock, Users, Bus, Phone, Mail } from 'lucide-react';

interface Passenger {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  seat_number: string;
}

interface ETicketProps {
  booking: {
    ticket_code: string;
    seats: string[];
    total_amount: number;
    status: string;
    passengers?: Passenger[];
    trip?: {
      departure_time: string;
      arrival_time: string;
      route?: {
        duration_hours: number;
        origin_city?: { name: string; state: string };
        destination_city?: { name: string; state: string };
      };
      bus?: {
        bus_type: string;
        plate_number: string;
        company?: { name: string; logo_url?: string | null; is_verified?: boolean };
      };
    };
  };
}

const ETicket = forwardRef<HTMLDivElement, ETicketProps>(({ booking }, ref) => {
  const trip = booking.trip;
  const passengers = booking.passengers || [];
  
  if (!trip || !trip.route || !trip.bus) {
    return <div ref={ref}>Loading...</div>;
  }

  return (
    <div
      ref={ref}
      className="bg-white text-black p-8 w-[800px] font-sans"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
            <Bus className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">NigeriaBus</h1>
            <p className="text-sm text-gray-600">E-Ticket / Boarding Pass</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Booking Reference</p>
          <p className="text-3xl font-mono font-bold tracking-wider text-gray-900">
            {booking.ticket_code}
          </p>
        </div>
      </div>

      {/* Company & Trip Info */}
      <div className="bg-gray-100 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-xl">
              🚌
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900">{trip.bus.company.name}</p>
              <p className="text-sm text-gray-600 capitalize">{trip.bus.bus_type} Bus • {trip.bus.plate_number}</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold uppercase">
            {booking.status}
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{trip.route.origin_city.name}</p>
            <p className="text-sm text-gray-600">{trip.route.origin_city.state}</p>
            <p className="text-xl font-semibold text-gray-700 mt-2">
              {format(new Date(trip.departure_time), 'h:mm a')}
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="flex-1 h-0.5 bg-gray-400" />
            <div className="mx-4 flex flex-col items-center">
              <MapPin className="w-6 h-6 text-green-600" />
              <p className="text-xs text-gray-500 mt-1">{trip.route.duration_hours}h</p>
            </div>
            <div className="flex-1 h-0.5 bg-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{trip.route.destination_city.name}</p>
            <p className="text-sm text-gray-600">{trip.route.destination_city.state}</p>
            <p className="text-xl font-semibold text-gray-700 mt-2">
              {format(new Date(trip.arrival_time), 'h:mm a')}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">TRAVEL DATE</span>
          </div>
          <p className="font-bold text-gray-900">{format(new Date(trip.departure_time), 'PPP')}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">DEPARTURE</span>
          </div>
          <p className="font-bold text-gray-900">{format(new Date(trip.departure_time), 'h:mm a')}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">SEAT(S)</span>
          </div>
          <p className="font-bold text-gray-900">{booking.seats.join(', ')}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <span className="text-xs font-medium">💰 AMOUNT PAID</span>
          </div>
          <p className="font-bold text-green-600 text-lg">₦{Number(booking.total_amount).toLocaleString()}</p>
        </div>
      </div>

      {/* Passengers */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-4 text-gray-900">Passenger Details</h3>
        <div className="space-y-3">
          {passengers.map((passenger, index) => (
            <div key={passenger.id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                {passenger.seat_number}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{passenger.full_name}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {passenger.phone}
                  </span>
                  {passenger.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {passenger.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Passenger {index + 1}</p>
                <p className="font-semibold text-gray-700">Seat {passenger.seat_number}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Placeholder & Instructions */}
      <div className="flex gap-6">
        <div className="flex-1 bg-gray-900 text-white rounded-xl p-6">
          <p className="text-sm font-medium mb-2">BOARDING INSTRUCTIONS</p>
          <ul className="text-sm space-y-1 text-gray-300">
            <li>• Arrive at the terminal 30 minutes before departure</li>
            <li>• Present this e-ticket (printed or on screen) at the gate</li>
            <li>• Have a valid ID ready for verification</li>
            <li>• Keep your booking reference handy</li>
          </ul>
        </div>
        <div className="w-40 bg-gray-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-2">
            <span className="text-xs text-gray-400 text-center">Scan at<br />terminal</span>
          </div>
          <p className="text-xs text-gray-500 text-center font-mono">{booking.ticket_code}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>This e-ticket is valid for the journey shown above. Non-transferable.</p>
        <p className="mt-1">Support: support@nigeriabus.com | +234 800 123 4567</p>
        <p className="mt-2 font-medium">Generated on {format(new Date(), 'PPP p')}</p>
      </div>
    </div>
  );
});

ETicket.displayName = 'ETicket';

export default ETicket;
