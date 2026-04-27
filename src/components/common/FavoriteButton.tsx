import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FavoriteButtonProps {
  venueId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function FavoriteButton({
  venueId,
  variant = "ghost",
  size = "icon",
  showText = false,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [venueId]);

  const checkFavoriteStatus = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteVenues') || '[]');
    setIsFavorited(favorites.includes(venueId));
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setLoading(true);

    try {
      const favorites = JSON.parse(localStorage.getItem('favoriteVenues') || '[]');
      
      if (isFavorited) {
        // Remove from favorites
        const updatedFavorites = favorites.filter((id: string) => id !== venueId);
        localStorage.setItem('favoriteVenues', JSON.stringify(updatedFavorites));
        setIsFavorited(false);
        toast.success("Removed from favorites");
        
        // If user is logged in, also update database
        if (user) {
          await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("venue_id", venueId);
        }
      } else {
        // Add to favorites
        const updatedFavorites = [...favorites, venueId];
        localStorage.setItem('favoriteVenues', JSON.stringify(updatedFavorites));
        setIsFavorited(true);
        toast.success("Added to favorites");
        
        // If user is logged in, also update database
        if (user) {
          await supabase
            .from("favorites")
            .insert({ user_id: user.id, venue_id: venueId });
        }
      }
    } catch (error) {
      toast.error("Failed to update favorites");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFavorite}
      disabled={loading}
      className={showText ? "gap-2" : ""}
    >
      <Heart
        className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
      />
      {showText && (isFavorited ? "Favorited" : "Add to Favorites")}
    </Button>
  );
}
