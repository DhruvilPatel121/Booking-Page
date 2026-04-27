import { useEffect, useState } from "react";
import { supabase } from "@/db/supabase";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, DollarSign, Calendar, BookOpen } from "lucide-react";
import type { DashboardStats, BookingWithDetails } from "@/types/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_bookings: 0,
    total_revenue: 0,
    active_slots: 0,
    total_users: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingWithDetails[]>(
    [],
  );

  useEffect(() => {
    fetchStats();
    fetchRecentBookings();
  }, []);

  const fetchStats = async () => {
    const [bookingsRes, ordersRes, slotsRes, usersRes] = await Promise.all([
      supabase.from("bookings").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total_amount").eq("status", "completed"),
      supabase
        .from("slots")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const totalRevenue = (ordersRes.data || []).reduce(
      (sum, order) => sum + Number(order.total_amount),
      0,
    );

    setStats({
      total_bookings: bookingsRes.count || 0,
      total_revenue: totalRevenue,
      active_slots: slotsRes.count || 0,
      total_users: usersRes.count || 0,
    });
  };

  const fetchRecentBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, slot:slots(*, sport:sports(*), venue:venues(*))")
      .order("created_at", { ascending: false })
      .limit(10);

    setRecentBookings(data || []);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_bookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.total_revenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Slots
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_slots}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.full_name}</TableCell>
                    <TableCell>{booking.slot?.sport?.name}</TableCell>
                    <TableCell>{booking.slot?.venue?.name}</TableCell>
                    <TableCell>{booking.slot?.slot_date}</TableCell>
                    <TableCell>{booking.status}</TableCell>
                    <TableCell className="text-right">
                      ₹{booking.booking_amount}
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
