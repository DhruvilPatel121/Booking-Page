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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { SlotWithDetails, Sport, Venue } from "@/types/types";

export default function SlotsManagement() {
  const [slots, setSlots] = useState<SlotWithDetails[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [open, setOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<SlotWithDetails | null>(null);
  const [formData, setFormData] = useState({
    sport_id: "",
    venue_id: "",
    slot_date: undefined as Date | undefined,
    start_time: "",
    end_time: "",
    duration_minutes: 60,
    total_capacity: 10,
    price: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchSlots();
    fetchSports();
    fetchVenues();
  }, []);

  const fetchSlots = async () => {
    const { data } = await supabase
      .from("slots")
      .select("*, sport:sports(*), venue:venues(*)")
      .order("slot_date", { ascending: false });
    setSlots(data || []);
  };

  const fetchSports = async () => {
    const { data } = await supabase
      .from("sports")
      .select("*")
      .eq("is_active", true)
      .order("name");
    setSports(data || []);
  };

  const fetchVenues = async () => {
    const { data } = await supabase.from("venues").select("*").order("name");
    setVenues(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slot_date) {
      toast.error("Please select a date");
      return;
    }

    const slotData = {
      ...formData,
      slot_date: format(formData.slot_date, "yyyy-MM-dd"),
    };

    if (editingSlot) {
      const { error } = await supabase
        .from("slots")
        .update(slotData)
        .eq("id", editingSlot.id);

      if (error) {
        toast.error("Failed to update slot");
        return;
      }
      toast.success("Slot updated");
    } else {
      const { error } = await supabase.from("slots").insert(slotData);

      if (error) {
        toast.error("Failed to create slot");
        return;
      }
      toast.success("Slot created");
    }

    setOpen(false);
    setEditingSlot(null);
    resetForm();
    fetchSlots();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slot?")) return;

    const { error } = await supabase.from("slots").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete slot");
      return;
    }

    toast.success("Slot deleted");
    fetchSlots();
  };

  const resetForm = () => {
    setFormData({
      sport_id: "",
      venue_id: "",
      slot_date: undefined,
      start_time: "",
      end_time: "",
      duration_minutes: 60,
      total_capacity: 10,
      price: 0,
      is_active: true,
    });
  };

  const openEditDialog = (slot: SlotWithDetails) => {
    setEditingSlot(slot);
    setFormData({
      sport_id: slot.sport_id,
      venue_id: slot.venue_id,
      slot_date: new Date(slot.slot_date),
      start_time: slot.start_time,
      end_time: slot.end_time,
      duration_minutes: slot.duration_minutes,
      total_capacity: slot.total_capacity,
      price: slot.price,
      is_active: slot.is_active,
    });
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Slots Management</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingSlot(null);
                  resetForm();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSlot ? "Edit Slot" : "Add Slot"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="venue_id">Venue</Label>
                  <Select
                    value={formData.venue_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, venue_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
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
                          setFormData({ ...formData, slot_date: date })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_minutes: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_capacity">Total Capacity</Label>
                  <Input
                    id="total_capacity"
                    type="number"
                    value={formData.total_capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_capacity: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingSlot ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sport</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>{slot.sport?.name}</TableCell>
                      <TableCell>{slot.venue?.name}</TableCell>
                      <TableCell>{slot.slot_date}</TableCell>
                      <TableCell>
                        {slot.start_time} - {slot.end_time}
                      </TableCell>
                      <TableCell>
                        {slot.booked_count}/{slot.total_capacity}
                      </TableCell>
                      <TableCell>₹{slot.price}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(slot)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(slot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
