-- Create function to increment slot booked count atomically
CREATE OR REPLACE FUNCTION public.increment_slot_booked_count(slot_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.slots
  SET booked_count = booked_count + 1,
      updated_at = now()
  WHERE id = slot_id_param
    AND booked_count < total_capacity;
END;
$$;