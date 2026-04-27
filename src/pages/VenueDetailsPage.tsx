import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/db/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { VenueReviews } from "@/components/common/VenueReviews";
import { MapPin, ArrowLeft, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import type { Venue, Sport, SlotWithDetails } from "@/types/types";

interface VenueWithSports extends Venue {
  sports?: Sport[];
}

export default function VenueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<VenueWithSports | null>(null);
  const [upcomingSlots, setUpcomingSlots] = useState<SlotWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVenueDetails();
      fetchUpcomingSlots();
    }
  }, [id]);

  const fetchVenueDetails = async () => {
    try {
      const { data: venueData, error: venueError } = await supabase
        .from("venues")
        .select("*")
        .eq("id", id)
        .single();

      if (venueError) throw venueError;

      const { data: sportsData } = await supabase
        .from("sports")
        .select("*")
        .in("id", venueData.sports_ids)
        .eq("is_active", true);

      setVenue({
        ...venueData,
        sports: sportsData || [],
      });
    } catch (error) {
      toast.error("Failed to load venue details");
      navigate("/venues");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingSlots = async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("slots")
      .select("*, sport:sports(*), venue:venues(*)")
      .eq("venue_id", id)
      .gte("slot_date", today)
      .eq("is_active", true)
      .order("slot_date")
      .order("start_time")
      .limit(10);

    const availableSlots = (data || []).filter(
      (slot: SlotWithDetails) => slot.booked_count < slot.total_capacity,
    );

    setUpcomingSlots(availableSlots);
  };

  const handleBookNow = () => {
    navigate(`/booking?venue_id=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">
          Loading venue details...
        </div>
      </div>
    );
  }

  if (!venue) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/venues")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Venues
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">
                      {venue.name}
                    </CardTitle>
                    {venue.location && (
                      <CardDescription className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4" />
                        {venue.location}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <FavoriteButton
                      venueId={venue.id}
                      size="default"
                      showText
                    />
                    <Badge
                      variant={
                        venue.status === "open" ? "default" : "secondary"
                      }
                      className="text-sm px-3 py-1"
                    >
                      {venue.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Available Sports
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {venue.sports && venue.sports.length > 0 ? (
                      venue.sports.map((sport) => (
                        <Badge
                          key={sport.id}
                          variant="outline"
                          className="text-sm px-3 py-1"
                        >
                          {sport.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No sports assigned
                      </span>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    About This Venue
                  </h3>
                  <p className="text-muted-foreground">
                    {venue.name} is a premium sports facility offering
                    world-class amenities for various sports activities. Our
                    venue is equipped with modern facilities and maintained to
                    the highest standards to ensure the best experience for all
                    players.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <li>• Changing Rooms</li>
                    <li>• Parking Available</li>
                    <li>• First Aid Facility</li>
                    <li>• Drinking Water</li>
                    <li>• Equipment Available</li>
                    <li>• Spectator Seating</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Upcoming Available Slots
                </CardTitle>
                <CardDescription>Book your preferred time slot</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSlots.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No upcoming slots available at the moment
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{slot.sport?.name}</div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {slot.slot_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            ₹{slot.price}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {slot.total_capacity - slot.booked_count} slots left
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <VenueReviews venueId={id!} />
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book This Venue</CardTitle>
                <CardDescription>Reserve your slot now</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize">
                      {venue.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sports Available:
                    </span>
                    <span className="font-medium">
                      {venue.sports?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Upcoming Slots:
                    </span>
                    <span className="font-medium">{upcomingSlots.length}</span>
                  </div>
                </div>
                <Separator />
                <Button
                  onClick={handleBookNow}
                  className="w-full"
                  size="lg"
                  disabled={venue.status !== "open"}
                >
                  Book Now
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Secure payment • Instant confirmation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
