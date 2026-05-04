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
import { PaymentButton } from "@/components/PaymentButton";
import { PaymentTestButton } from "@/components/PaymentTestButton";

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
    sport?: { id: string; name: string };
  } | null>(null);
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
            <div className="space-y-6">
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
                <PaymentButton
                  amount={selectedSlot.price}
                  bookingId={`BK-${Date.now()}`}
                  sportName={selectedSlot.sport?.name || ''}
                  venueName={selectedSlot.venue?.name || ''}
                  slotTime={`${selectedSlot.start_time} - ${selectedSlot.end_time}`}
                  slotDate={selectedSlot.slot_date}
                  firstName={formData.full_name}
                  email={formData.email}
                  phone={formData.mobile}
                  onPaymentComplete={(success) => {
                    if (success) {
                      toast.success('Payment completed successfully!');
                      // You can navigate to success page or handle post-payment logic here
                    }
                  }}
                />
              )}

              {/* Payment Test Section */}
              <div className="border-t pt-4">
                <PaymentTestButton />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
