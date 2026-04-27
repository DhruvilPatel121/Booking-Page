export type UserRole = 'user' | 'admin';
export type VenueStatus = 'open' | 'full' | 'closed';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Sport {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string | null;
  status: VenueStatus;
  sports_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Slot {
  id: string;
  sport_id: string;
  venue_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_capacity: number;
  booked_count: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SlotWithDetails extends Slot {
  sport?: Sport;
  venue?: Venue;
}

export interface Booking {
  id: string;
  user_id: string;
  slot_id: string;
  full_name: string;
  mobile: string;
  email: string;
  gender: string;
  booking_amount: number;
  status: BookingStatus;
  order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  slot?: SlotWithDetails;
}

export interface Order {
  id: string;
  user_id: string | null;
  items: unknown;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  sport_id: string;
  points: number;
  wins: number;
  matches_played: number;
  rank: number | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardWithSport extends LeaderboardEntry {
  sport?: Sport;
}

export interface BookingFormData {
  full_name: string;
  mobile: string;
  email: string;
  gender: string;
  sport_id: string;
  slot_date: string;
  slot_id: string;
}

export interface DashboardStats {
  total_bookings: number;
  total_revenue: number;
  active_slots: number;
  total_users: number;
}

export interface RevenueData {
  total_revenue: number;
  revenue_this_month: number;
  revenue_this_week: number;
  average_booking_amount: number;
}

export interface Review {
  id: string;
  venue_id: string;
  user_id: string | null;
  booking_id: string | null;
  rating: number;
  comment: string | null;
  reviewer_name: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  venue_id: string;
  created_at: string;
}

export interface VenueWithDetails extends Venue {
  average_rating?: number;
  review_count?: number;
  is_favorited?: boolean;
}