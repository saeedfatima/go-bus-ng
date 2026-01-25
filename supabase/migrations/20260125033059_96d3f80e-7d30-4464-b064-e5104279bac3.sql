-- Create function to check seat availability and prevent duplicate bookings
CREATE OR REPLACE FUNCTION public.check_seat_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  seat TEXT;
  existing_booking_id UUID;
BEGIN
  -- Check each seat in the booking
  FOREACH seat IN ARRAY NEW.seats
  LOOP
    -- Check if seat is already booked for this trip with pending or confirmed status
    SELECT id INTO existing_booking_id
    FROM public.bookings
    WHERE trip_id = NEW.trip_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status IN ('pending', 'confirmed')
      AND seat = ANY(seats);
    
    IF existing_booking_id IS NOT NULL THEN
      RAISE EXCEPTION 'Seat % is already booked for this trip', seat;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce seat uniqueness on insert and update
DROP TRIGGER IF EXISTS enforce_unique_trip_seat ON public.bookings;
CREATE TRIGGER enforce_unique_trip_seat
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_seat_availability();