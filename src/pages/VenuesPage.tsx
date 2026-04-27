import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/db/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { MapPin, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import type { Venue, Sport } from "@/types/types";

interface VenueWithSports extends Venue {
  sports?: Sport[];
}

export default function VenuesPage() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<VenueWithSports[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<VenueWithSports[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterVenues();
  }, [venues, searchTerm, selectedSport, selectedLocation]);

  const fetchData = async () => {
    try {
      const [venuesRes, sportsRes] = await Promise.all([
        supabase.from("venues").select("*").eq("status", "open").order("name"),
        supabase.from("sports").select("*").eq("is_active", true).order("name"),
      ]);

      if (venuesRes.error) throw venuesRes.error;
      if (sportsRes.error) throw sportsRes.error;

      const sportsData = sportsRes.data || [];
      setSports(sportsData);

      const venuesWithSports = (venuesRes.data || []).map((venue) => ({
        ...venue,
        sports: sportsData.filter((sport) =>
          venue.sports_ids.includes(sport.id),
        ),
      }));

      setVenues(venuesWithSports);
      setFilteredVenues(venuesWithSports);
    } catch (error) {
      toast.error("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  const filterVenues = () => {
    let filtered = venues;

    if (searchTerm) {
      filtered = filtered.filter(
        (venue) =>
          venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venue.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedSport !== "all") {
      filtered = filtered.filter((venue) =>
        venue.sports_ids.includes(selectedSport),
      );
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter((venue) =>
        venue.location?.toLowerCase().includes(selectedLocation.toLowerCase()),
      );
    }

    setFilteredVenues(filtered);
  };

  const uniqueLocations = Array.from(
    new Set(venues.map((v) => v.location).filter(Boolean)),
  ) as string[];

  const handleViewDetails = (venueId: string) => {
    navigate(`/venues/${venueId}`);
  };

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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Available Venues
          </h1>
          <p className="text-muted-foreground">
            Browse and book your preferred sports venue
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Find the perfect venue for your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {sports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredVenues.length} of {venues.length} venues
            </div>
          </CardContent>
        </Card>

        {filteredVenues.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {loading
                  ? "Loading venues..."
                  : "No venues found matching your criteria"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
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
