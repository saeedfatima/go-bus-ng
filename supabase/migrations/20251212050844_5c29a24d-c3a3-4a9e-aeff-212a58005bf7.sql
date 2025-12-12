-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'company_admin', 'passenger');

-- Create enum for bus types
CREATE TYPE public.bus_type AS ENUM ('standard', 'luxury', 'executive');

-- Create enum for trip status
CREATE TYPE public.trip_status AS ENUM ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cities table
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create buses table
CREATE TABLE public.buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plate_number TEXT NOT NULL,
  bus_type bus_type NOT NULL DEFAULT 'standard',
  total_seats INTEGER NOT NULL DEFAULT 48,
  amenities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create routes table
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  origin_city_id UUID NOT NULL REFERENCES public.cities(id),
  destination_city_id UUID NOT NULL REFERENCES public.cities(id),
  base_price NUMERIC(10,2) NOT NULL,
  duration_hours NUMERIC(4,1) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  available_seats INTEGER NOT NULL,
  status trip_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seats TEXT[] NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  ticket_code TEXT NOT NULL UNIQUE,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  passenger_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user owns company
CREATE OR REPLACE FUNCTION public.owns_company(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.companies
    WHERE id = _company_id
      AND owner_id = _user_id
  )
$$;

-- Function to get company id for a bus
CREATE OR REPLACE FUNCTION public.get_bus_company_id(_bus_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.buses WHERE id = _bus_id
$$;

-- Function to get company id for a route
CREATE OR REPLACE FUNCTION public.get_route_company_id(_route_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.routes WHERE id = _route_id
$$;

-- Function to get company id for a trip
CREATE OR REPLACE FUNCTION public.get_trip_company_id(_trip_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.company_id FROM public.trips t
  JOIN public.routes r ON t.route_id = r.id
  WHERE t.id = _trip_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for companies
CREATE POLICY "Anyone can view companies" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "Company owners can update their company" ON public.companies
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create companies" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for cities (public read)
CREATE POLICY "Anyone can view cities" ON public.cities
  FOR SELECT USING (true);

-- RLS Policies for buses
CREATE POLICY "Anyone can view buses" ON public.buses
  FOR SELECT USING (true);

CREATE POLICY "Company owners can manage buses" ON public.buses
  FOR INSERT WITH CHECK (public.owns_company(auth.uid(), company_id));

CREATE POLICY "Company owners can update buses" ON public.buses
  FOR UPDATE USING (public.owns_company(auth.uid(), company_id));

CREATE POLICY "Company owners can delete buses" ON public.buses
  FOR DELETE USING (public.owns_company(auth.uid(), company_id));

-- RLS Policies for routes
CREATE POLICY "Anyone can view routes" ON public.routes
  FOR SELECT USING (true);

CREATE POLICY "Company owners can manage routes" ON public.routes
  FOR INSERT WITH CHECK (public.owns_company(auth.uid(), company_id));

CREATE POLICY "Company owners can update routes" ON public.routes
  FOR UPDATE USING (public.owns_company(auth.uid(), company_id));

CREATE POLICY "Company owners can delete routes" ON public.routes
  FOR DELETE USING (public.owns_company(auth.uid(), company_id));

-- RLS Policies for trips
CREATE POLICY "Anyone can view scheduled trips" ON public.trips
  FOR SELECT USING (true);

CREATE POLICY "Company owners can manage trips" ON public.trips
  FOR INSERT WITH CHECK (public.owns_company(auth.uid(), public.get_route_company_id(route_id)));

CREATE POLICY "Company owners can update trips" ON public.trips
  FOR UPDATE USING (public.owns_company(auth.uid(), public.get_trip_company_id(id)));

CREATE POLICY "Company owners can delete trips" ON public.trips
  FOR DELETE USING (public.owns_company(auth.uid(), public.get_trip_company_id(id)));

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Company owners can view bookings for their trips" ON public.bookings
  FOR SELECT USING (public.owns_company(auth.uid(), public.get_trip_company_id(trip_id)));

CREATE POLICY "Authenticated users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  
  -- Default role is passenger
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'passenger');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON public.buses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Nigerian cities
INSERT INTO public.cities (name, state) VALUES
  ('Lagos', 'Lagos'),
  ('Abuja', 'FCT'),
  ('Kano', 'Kano'),
  ('Port Harcourt', 'Rivers'),
  ('Kaduna', 'Kaduna'),
  ('Ibadan', 'Oyo'),
  ('Benin City', 'Edo'),
  ('Enugu', 'Enugu'),
  ('Calabar', 'Cross River'),
  ('Owerri', 'Imo');