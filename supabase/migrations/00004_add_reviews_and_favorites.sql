-- Create reviews table
CREATE TABLE public.reviews
(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  reviewer_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE public.favorites
(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, venue_id)
);

-- Create indexes
CREATE INDEX idx_reviews_venue_id ON public.reviews(venue_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_venue_id ON public.favorites(venue_id);

-- RLS Policies for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR
SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR
INSERT TO authenticated
  WITH CHECK (
auth.uid()
= user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR
UPDATE TO authenticated
  USING (auth.uid() = user_id)
WITH CHECK
(auth.uid
() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR
DELETE TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR
SELECT TO authenticated
USING
(auth.uid
() = user_id);

CREATE POLICY "Users can create their own favorites" ON public.favorites
  FOR
INSERT TO authenticated
  WITH CHECK (
auth.uid()
= user_id);

CREATE POLICY "Users can delete their own favorites" ON public.favorites
  FOR
DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Function to get average rating for a venue
CREATE OR REPLACE FUNCTION get_venue_average_rating
(venue_uuid uuid)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
SELECT COALESCE(AVG(rating), 0)
::numeric
(3,2)
  FROM public.reviews
  WHERE venue_id = venue_uuid;
$$;

-- Function to get review count for a venue
CREATE OR REPLACE FUNCTION get_venue_review_count
(venue_uuid uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
SELECT COUNT(*)
FROM public.reviews
WHERE venue_id = venue_uuid;
$$;