import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { MapPin, ArrowLeft, Heart } from "lucide-react";
import { toast } from "sonner";
import type { Venue, Sport } from "@/types/types";

interface VenueWithSports extends Venue {
  sports?: Sport[];
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<VenueWithSports[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const favoriteVenueIds = JSON.parse(localStorage.getItem('favoriteVenues') || '[]');

      if (favoriteVenueIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: venuesData } = await supabase
        .from("venues")
        .select("*, sports(*)")
        .in("id", favoriteVenueIds);

      setVenues(venuesData || []);
    } catch (error) {
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (venueId: string) => {
    navigate(`/venues/${venueId}`);
  };

  const handleRemoveFavorite = () => {
    fetchFavorites();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">
          Loading favorites...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              My Favorite Venues
            </h1>
          </div>
          <p className="text-muted-foreground">
            Your saved venues for quick access
          </p>
        </div>

        {venues.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  No favorites yet
                </p>
                <p className="text-muted-foreground mb-4">
                  Start adding venues to your favorites to see them here
                </p>
                <Button asChild>
                  <a href="/venues">Browse Venues</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <Card
                key={venue.id}
                className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer relative"
                onClick={() => handleViewDetails(venue.id)}
              >
                <div
                  className="absolute top-4 right-4 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FavoriteButton venueId={venue.id} variant="ghost" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between pr-8">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {venue.name}
                      </CardTitle>
                      {venue.location && (
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {venue.location}
                        </CardDescription>
                      )}
                    </div>
                    <Badge
                      variant={
                        venue.status === "open" ? "default" : "secondary"
                      }
                    >
                      {venue.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Available Sports:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {venue.sports && venue.sports.length > 0 ? (
                        venue.sports.map((sport) => (
                          <Badge key={sport.id} variant="outline">
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
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(venue.id);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/booking?venue_id=${venue.id}`);
                      }}
                      className="flex-1"
                      disabled={venue.status !== "open"}
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
