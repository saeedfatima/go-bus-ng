import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cities } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SearchForm = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');

  const handleSwapCities = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination && date) {
      navigate(`/search?from=${origin}&to=${destination}&date=${date}&passengers=${passengers}`);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="bg-card rounded-2xl shadow-xl p-4 md:p-6 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Origin */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              From
            </label>
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger className="h-12 bg-background">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.name} disabled={city.name === destination}>
                    {city.name}, {city.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap Button */}
          <div className="hidden md:flex md:col-span-1 justify-center pb-1">
            <button
              type="button"
              onClick={handleSwapCities}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              To
            </label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="h-12 bg-background">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.name} disabled={city.name === origin}>
                    {city.name}, {city.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Passengers */}
          <div className="md:col-span-1 space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Seats
            </label>
            <Select value={passengers} onValueChange={setPassengers}>
              <SelectTrigger className="h-12 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-12 gap-2"
              disabled={!origin || !destination || !date}
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
