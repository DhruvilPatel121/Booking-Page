import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Venue, Sport, VenueStatus } from "@/types/types";

export default function VenuesManagement() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [open, setOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    status: "open" as VenueStatus,
    sports_ids: [] as string[],
  });

  useEffect(() => {
    fetchVenues();
    fetchSports();
  }, []);

  const fetchVenues = async () => {
    const { data } = await supabase.from("venues").select("*").order("name");
    setVenues(data || []);
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

    if (editingVenue) {
      const { error } = await supabase
        .from("venues")
        .update(formData)
        .eq("id", editingVenue.id);

      if (error) {
        toast.error("Failed to update venue");
        return;
      }
      toast.success("Venue updated");
    } else {
      const { error } = await supabase.from("venues").insert(formData);

      if (error) {
        toast.error("Failed to create venue");
        return;
      }
      toast.success("Venue created");
    }

    setOpen(false);
    setEditingVenue(null);
    setFormData({ name: "", location: "", status: "open", sports_ids: [] });
    fetchVenues();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this venue?")) return;

    const { error } = await supabase.from("venues").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete venue");
      return;
    }

    toast.success("Venue deleted");
    fetchVenues();
  };

  const openEditDialog = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      location: venue.location || "",
      status: venue.status,
      sports_ids: venue.sports_ids,
    });
    setOpen(true);
  };

  const getSportNames = (sportIds: string[]) => {
    return sportIds
      .map((id) => sports.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Venues Management</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingVenue(null);
                  setFormData({
                    name: "",
                    location: "",
                    status: "open",
                    sports_ids: [],
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Venue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingVenue ? "Edit Venue" : "Add Venue"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Venue Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: VenueStatus) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned Sports</Label>
                  <div className="space-y-2">
                    {sports.map((sport) => (
                      <div
                        key={sport.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={sport.id}
                          checked={formData.sports_ids.includes(sport.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                sports_ids: [...formData.sports_ids, sport.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                sports_ids: formData.sports_ids.filter(
                                  (id) => id !== sport.id,
                                ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={sport.id}>{sport.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingVenue ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Assigned Sports</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.map((venue) => (
                  <TableRow key={venue.id}>
                    <TableCell className="font-medium">{venue.name}</TableCell>
                    <TableCell>{venue.location}</TableCell>
                    <TableCell>
                      {getSportNames(venue.sports_ids) || "None"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          venue.status === "open" ? "default" : "secondary"
                        }
                      >
                        {venue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(venue)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(venue.id)}
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
