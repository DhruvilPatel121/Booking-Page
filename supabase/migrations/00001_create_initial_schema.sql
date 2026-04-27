-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create venue status enum
CREATE TYPE public.venue_status AS ENUM ('open', 'full', 'closed');

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  role public.user_role NOT NULL DEFAULT 'user'::public.user_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create sports table
CREATE TABLE public.sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create venues table
CREATE TABLE public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  location text,
  status public.venue_status NOT NULL DEFAULT 'open'::public.venue_status,
  sports_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create slots table
CREATE TABLE public.slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration_minutes int NOT NULL,
  total_capacity int NOT NULL CHECK (total_capacity > 0),
  booked_count int NOT NULL DEFAULT 0 CHECK (booked_count >= 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT check_booked_not_exceed_capacity CHECK (booked_count <= total_capacity)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slot_id uuid NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  mobile text NOT NULL,
  email text NOT NULL,
  gender text NOT NULL,
  booking_amount numeric(10,2) NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending'::public.booking_status,
  order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  items jsonb NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status public.order_status NOT NULL DEFAULT 'pending'::public.order_status,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  customer_email text,
  customer_name text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create leaderboard table
CREATE TABLE public.leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  points int NOT NULL DEFAULT 0,
  wins int NOT NULL DEFAULT 0,
  matches_played int NOT NULL DEFAULT 0,
  rank int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_sports_is_active ON public.sports(is_active);
CREATE INDEX idx_venues_status ON public.venues(status);
CREATE INDEX idx_slots_sport_id ON public.slots(sport_id);
CREATE INDEX idx_slots_venue_id ON public.slots(venue_id);
CREATE INDEX idx_slots_slot_date ON public.slots(slot_date);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_slot_id ON public.bookings(slot_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_stripe_session_id ON public.orders(stripe_session_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_leaderboard_sport_id ON public.leaderboard(sport_id);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(rank);

-- Create helper function for role check
CREATE OR REPLACE FUNCTION public.has_role(uid uuid, role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = uid AND p.role = role_name::public.user_role
  );
$$;

-- Create trigger function for user sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
  );
  RETURN NEW;
END;
$$;

-- Create trigger for user sync
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Sports policies (public read, admin write)
CREATE POLICY "Anyone can view active sports" ON public.sports
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all sports" ON public.sports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage sports" ON public.sports
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Venues policies (public read, admin write)
CREATE POLICY "Anyone can view open venues" ON public.venues
  FOR SELECT USING (status = 'open'::public.venue_status);

CREATE POLICY "Admins can view all venues" ON public.venues
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage venues" ON public.venues
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Slots policies (public read, admin write)
CREATE POLICY "Anyone can view active slots" ON public.slots
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all slots" ON public.slots
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage slots" ON public.slots
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage bookings" ON public.bookings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage orders" ON public.orders
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Leaderboard policies (public read, admin write)
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage leaderboard" ON public.leaderboard
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample sports data
INSERT INTO public.sports (name, description) VALUES
  ('Football', 'Team sport played with a spherical ball'),
  ('Basketball', 'Team sport played on a rectangular court'),
  ('Tennis', 'Racket sport played individually or in pairs'),
  ('Cricket', 'Bat-and-ball game played between two teams'),
  ('Badminton', 'Racquet sport played with a shuttlecock');

-- Insert sample venues data
INSERT INTO public.venues (name, location, status, sports_ids) VALUES
  ('Arena Sports Complex', 'Downtown District', 'open', ARRAY[]::uuid[]),
  ('City Stadium', 'North Zone', 'open', ARRAY[]::uuid[]),
  ('Elite Sports Center', 'East Side', 'open', ARRAY[]::uuid[]),
  ('Victory Ground', 'West End', 'open', ARRAY[]::uuid[]),
  ('Champions Court', 'South Plaza', 'open', ARRAY[]::uuid[]);