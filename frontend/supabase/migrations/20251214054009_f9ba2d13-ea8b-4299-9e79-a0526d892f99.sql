-- Create booking_passengers table for multi-passenger support
CREATE TABLE public.booking_passengers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  nin TEXT,
  seat_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_passengers ENABLE ROW LEVEL SECURITY;

-- Users can view passengers for their own bookings
CREATE POLICY "Users can view their booking passengers"
ON public.booking_passengers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = booking_passengers.booking_id 
    AND bookings.user_id = auth.uid()
  )
);

-- Users can insert passengers for their own bookings
CREATE POLICY "Users can add passengers to their bookings"
ON public.booking_passengers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = booking_passengers.booking_id 
    AND bookings.user_id = auth.uid()
  )
);

-- Company owners can view passengers for their trips
CREATE POLICY "Company owners can view booking passengers"
ON public.booking_passengers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_passengers.booking_id
    AND owns_company(auth.uid(), get_trip_company_id(b.trip_id))
  )
);

-- Add hold/expiry fields to bookings table
ALTER TABLE public.bookings
ADD COLUMN hold_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN payment_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN cancellation_reason TEXT;

-- Add 'expired' to booking_status enum
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'expired';

-- Update bookings status check constraint if needed (enum handles this)

-- Create index for faster lookups on hold expiry
CREATE INDEX idx_bookings_hold_expires_at ON public.bookings(hold_expires_at) WHERE status = 'pending';