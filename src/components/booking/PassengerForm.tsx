import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface PassengerFormData {
  fullName: string;
  phone: string;
  email: string;
  nin: string;
  seatNumber: string;
}

interface PassengerFormProps {
  index: number;
  passenger: PassengerFormData;
  seatNumber: string;
  onChange: (index: number, field: keyof PassengerFormData, value: string) => void;
  onRemove?: (index: number) => void;
  showRemove: boolean;
}

const PassengerForm = ({ index, passenger, seatNumber, onChange, onRemove, showRemove }: PassengerFormProps) => {
  return (
    <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            {seatNumber}
          </span>
          <h4 className="font-medium">Passenger {index + 1}</h4>
        </div>
        {showRemove && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`fullName-${index}`}>Full Name *</Label>
          <Input
            id={`fullName-${index}`}
            value={passenger.fullName}
            onChange={(e) => onChange(index, 'fullName', e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`phone-${index}`}>Phone Number *</Label>
          <Input
            id={`phone-${index}`}
            type="tel"
            value={passenger.phone}
            onChange={(e) => onChange(index, 'phone', e.target.value)}
            placeholder="Enter phone number"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`email-${index}`}>Email (Optional)</Label>
          <Input
            id={`email-${index}`}
            type="email"
            value={passenger.email}
            onChange={(e) => onChange(index, 'email', e.target.value)}
            placeholder="Enter email address"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`nin-${index}`}>NIN (Optional)</Label>
          <Input
            id={`nin-${index}`}
            value={passenger.nin}
            onChange={(e) => onChange(index, 'nin', e.target.value)}
            placeholder="National ID Number"
            maxLength={11}
          />
        </div>
      </div>
    </div>
  );
};

export default PassengerForm;
