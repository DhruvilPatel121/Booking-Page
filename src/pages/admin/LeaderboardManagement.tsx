import { useEffect, useState } from "react";
import { supabase } from "@/db/supabase";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { LeaderboardWithSport, Sport } from "@/types/types";

export default function LeaderboardManagement() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardWithSport[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [open, setOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LeaderboardWithSport | null>(
    null,
  );
  const [formData, setFormData] = useState({
    player_name: "",
    sport_id: "",
    points: 0,
    wins: 0,
    matches_played: 0,
  });

  useEffect(() => {
    fetchLeaderboard();
    fetchSports();
  }, []);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("leaderboard")
      .select("*, sport:sports(*)")
      .order("points", { ascending: false });
    setLeaderboard(data || []);
  };

  const fetchSports = async () => {
    const { data } = await supabase
      .from("sports")
      .select("*")
      .eq("is_active", true)
      .order("name");
    setSports(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEntry) {
      const { error } = await supabase
        .from("leaderboard")
        .update(formData)
        .eq("id", editingEntry.id);

      if (error) {
        toast.error("Failed to update entry");
        return;
      }
      toast.success("Entry updated");
    } else {
      const { error } = await supabase.from("leaderboard").insert(formData);

      if (error) {
        toast.error("Failed to create entry");
        return;
      }
      toast.success("Entry created");
    }

    setOpen(false);
    setEditingEntry(null);
    setFormData({
      player_name: "",
      sport_id: "",
      points: 0,
      wins: 0,
      matches_played: 0,
    });
    fetchLeaderboard();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    const { error } = await supabase.from("leaderboard").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete entry");
      return;
    }

    toast.success("Entry deleted");
    fetchLeaderboard();
  };

  const openEditDialog = (entry: LeaderboardWithSport) => {
    setEditingEntry(entry);
    setFormData({
      player_name: entry.player_name,
      sport_id: entry.sport_id,
      points: entry.points,
      wins: entry.wins,
      matches_played: entry.matches_played,
    });
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Leaderboard Management</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingEntry(null);
                  setFormData({
                    player_name: "",
                    sport_id: "",
                    points: 0,
                    wins: 0,
                    matches_played: 0,
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Entry" : "Add Entry"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="player_name">Player Name</Label>
                  <Input
                    id="player_name"
                    value={formData.player_name}
                    onChange={(e) =>
                      setFormData({ ...formData, player_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sport_id">Sport</Label>
                  <Select
                    value={formData.sport_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sport_id: value })
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
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        points: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wins">Wins</Label>
                  <Input
                    id="wins"
                    type="number"
                    value={formData.wins}
                    onChange={(e) =>
                      setFormData({ ...formData, wins: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matches_played">Matches Played</Label>
                  <Input
                    id="matches_played"
                    type="number"
                    value={formData.matches_played}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        matches_played: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingEntry ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Player Name</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Wins</TableHead>
                  <TableHead className="text-right">Matches</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{entry.player_name}</TableCell>
                    <TableCell>{entry.sport?.name}</TableCell>
                    <TableCell className="text-right">{entry.points}</TableCell>
                    <TableCell className="text-right">{entry.wins}</TableCell>
                    <TableCell className="text-right">
                      {entry.matches_played}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
