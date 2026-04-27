import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/db/supabase";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Sport, LeaderboardWithSport } from "@/types/types";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [leaderboard, setLeaderboard] = useState<LeaderboardWithSport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedSport]);

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

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("leaderboard")
        .select("*, sport:sports(*)")
        .order("points", { ascending: false });

      if (selectedSport !== "all") {
        query = query.eq("sport_id", selectedSport);
      }

      const { data, error } = await query;

      if (error) throw error;

      const rankedData = (data || []).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      setLeaderboard(rankedData);
    } catch (error) {
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Leaderboard</CardTitle>
            <CardDescription>Top players across all sports</CardDescription>
            <div className="pt-4">
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="w-full md:w-64">
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
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leaderboard entries found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Player Name</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="text-right">Wins</TableHead>
                      <TableHead className="text-right">Matches</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.rank}
                        </TableCell>
                        <TableCell>{entry.player_name}</TableCell>
                        <TableCell>{entry.sport?.name}</TableCell>
                        <TableCell className="text-right">
                          {entry.points}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.wins}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.matches_played}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
