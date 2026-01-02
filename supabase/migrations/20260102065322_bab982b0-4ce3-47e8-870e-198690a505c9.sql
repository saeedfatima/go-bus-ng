-- Add RLS policy to allow admins to update companies (for verification)
CREATE POLICY "Admins can update companies"
ON public.companies
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to update bookings (for issue resolution)
CREATE POLICY "Admins can update all bookings"
ON public.bookings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all booking passengers
CREATE POLICY "Admins can view all booking passengers"
ON public.booking_passengers
FOR SELECT
USING (has_role(auth.uid(), 'admin'));