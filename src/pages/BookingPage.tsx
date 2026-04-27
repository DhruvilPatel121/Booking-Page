import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/db/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, MapPin } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Sport, Slot, SlotWithDetails } from "@/types/types";

export default function BookingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedVenueId = searchParams.get("venue_id");

  const [sports, setSports] = useState<Sport[]>([]);
  const [slots, setSlots] = useState<SlotWithDetails[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<{
    id: string;
    name: string;
    location?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    mobile: profile?.phone || "",
    email: profile?.email || "",
    gender: "",
    sport_id: "",
    slot_date: undefined as Date | undefined,
    slot_id: "",
  });

  const selectedSlot = slots.find((s) => s.id === formData.slot_id);
  const isSlotFull = selectedSlot
    ? selectedSlot.booked_count >= selectedSlot.total_capacity
    : false;

  useEffect(() => {
    fetchSports();
    if (preSelectedVenueId) {
      fetchVenueInfo(preSelectedVenueId);
    }
  }, [preSelectedVenueId]);

  const fetchVenueInfo = async (venueId: string) => {
    const { data } = await supabase
      .from("venues")
      .select("id, name, location")
      .eq("id", venueId)
      .single();

    if (data) {
      setSelectedVenue(data);
    }
  };

  useEffect(() => {
    if (formData.sport_id && formData.slot_date) {
      fetchAvailableSlots();
    } else {
      setSlots([]);
    }
  }, [formData.sport_id, formData.slot_date]);

  const fetchSports = async () => {
    const { data, error } = await supabase
      .from("sports")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      toast.error("Failed to load sports");
      return;
    }

    setSports(data || []);
  };

  const fetchAvailableSlots = async () => {
    if (!formData.sport_id || !formData.slot_date) return;

    const dateStr = format(formData.slot_date, "yyyy-MM-dd");

    let query = supabase
      .from("slots")
      .select("*, sport:sports(*), venue:venues(*)")
      .eq("sport_id", formData.sport_id)
      .eq("slot_date", dateStr)
      .eq("is_active", true)
      .order("start_time");

    const { data: slotsData, error: slotsError } = await query;

    if (slotsError) {
      toast.error("Failed to load slots");
      return;
    }

    const availableSlots = (slotsData || []).filter((slot: SlotWithDetails) => {
      if (!slot.venue) return false;
      const venue = slot.venue;
      const isVenueMatch = preSelectedVenueId
        ? venue.id === preSelectedVenueId
        : true;
      return (
        isVenueMatch &&
        venue.status === "open" &&
        venue.sports_ids.includes(formData.sport_id) &&
        slot.booked_count < slot.total_capacity
      );
    });

    setSlots(availableSlots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.full_name ||
      !formData.mobile ||
      !formData.email ||
      !formData.gender ||
      !formData.slot_id
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isSlotFull) {
      toast.error("This slot is full");
      return;
    }

    setLoading(true);

    try {
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user?.id || null,
          slot_id: formData.slot_id,
          full_name: formData.full_name,
          mobile: formData.mobile,
          email: formData.email,
          gender: formData.gender,
          booking_amount: selectedSlot?.price || 0,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      const { data: checkoutData, error: checkoutError } =
        await supabase.functions.invoke("create_stripe_checkout", {
          body: {
            items: [
              {
                name: `${selectedSlot?.sport?.name} - ${selectedSlot?.venue?.name}`,
                price: selectedSlot?.price || 0,
                quantity: 1,
                booking_id: booking.id,
              },
            ],
            currency: "inr",
          },
        });

      if (checkoutError) {
        const errorMsg = await checkoutError?.context?.text();
        throw new Error(errorMsg || checkoutError.message);
      }

      if (checkoutData?.data?.url) {
        window.open(checkoutData.data.url, "_blank");
        toast.success("Redirecting to payment...");
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Book Your Slot</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Fill in the details to book your sports slot
            </CardDescription>
            {selectedVenue && (
              <div className="mt-4 p-4 bg-accent rounded-lg border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Selected Venue
                    </p>
                    <p className="text-lg font-semibold text-primary mt-1">
                      {selectedVenue.name}
                    </p>
                    {selectedVenue.location && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedVenue.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport">Sport</Label>
                <Select
                  value={formData.sport_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sport_id: value, slot_id: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Booking Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.slot_date
                        ? format(formData.slot_date, "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.slot_date}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          slot_date: date,
                          slot_id: "",
                        })
                      }
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {formData.sport_id && formData.slot_date && (
                <div className="space-y-2">
                  <Label htmlFor="slot">Available Slots</Label>
                  {slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No available slots for selected date
                    </p>
                  ) : (
                    <Select
                      value={formData.slot_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, slot_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {slots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.venue?.name} - {slot.start_time} to{" "}
                            {slot.end_time} (₹{slot.price}) -{" "}
                            {slot.total_capacity - slot.booked_count} slots left
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {selectedSlot && (
                <div className="p-4 bg-accent rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Venue:</span>
                    <span className="text-sm">{selectedSlot.venue?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Booking Amount:</span>
                    <span className="text-sm font-semibold">
                      ₹{selectedSlot.price}
                    </span>
                  </div>
                  {isSlotFull && (
                    <p className="text-sm text-destructive font-medium">
                      Slot Full
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !formData.slot_id || isSlotFull}
              >
                {loading ? "Processing..." : "Pay Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
