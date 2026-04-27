import { useEffect, useState } from "react";
import { supabase } from "@/db/supabase";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";

const COLORS = [
  "hsl(142, 76%, 36%)",
  "hsl(173, 58%, 39%)",
  "hsl(197, 37%, 24%)",
  "hsl(43, 74%, 66%)",
  "hsl(27, 87%, 67%)",
];

export default function RevenueAnalytics() {
  const [revenueData, setRevenueData] = useState({
    total_revenue: 0,
    revenue_this_month: 0,
    revenue_this_week: 0,
    average_booking_amount: 0,
  });
  const [revenueBySport, setRevenueBySport] = useState<
    Array<{ name: string; revenue: number }>
  >([]);
  const [revenueByVenue, setRevenueByVenue] = useState<
    Array<{ name: string; revenue: number }>
  >([]);
  const [revenueOverTime, setRevenueOverTime] = useState<
    Array<{ date: string; revenue: number }>
  >([]);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    const { data: orders } = await supabase
      .from("orders")
      .select("*, items")
      .eq("status", "completed");

    if (!orders) return;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total_amount),
      0,
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const revenueThisMonth = orders
      .filter((o) => new Date(o.created_at) >= startOfMonth)
      .reduce((sum, order) => sum + Number(order.total_amount), 0);

    const revenueThisWeek = orders
      .filter((o) => new Date(o.created_at) >= startOfWeek)
      .reduce((sum, order) => sum + Number(order.total_amount), 0);

    const avgBookingAmount =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    setRevenueData({
      total_revenue: totalRevenue,
      revenue_this_month: revenueThisMonth,
      revenue_this_week: revenueThisWeek,
      average_booking_amount: avgBookingAmount,
    });

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*, slot:slots(*, sport:sports(*), venue:venues(*))")
      .eq("status", "confirmed");

    if (bookings) {
      const sportRevenue: Record<string, number> = {};
      const venueRevenue: Record<string, number> = {};

      bookings.forEach((booking) => {
        const sportName = booking.slot?.sport?.name || "Unknown";
        const venueName = booking.slot?.venue?.name || "Unknown";
        const amount = Number(booking.booking_amount);

        sportRevenue[sportName] = (sportRevenue[sportName] || 0) + amount;
        venueRevenue[venueName] = (venueRevenue[venueName] || 0) + amount;
      });

      setRevenueBySport(
        Object.entries(sportRevenue).map(([name, revenue]) => ({
          name,
          revenue,
        })),
      );

      setRevenueByVenue(
        Object.entries(venueRevenue).map(([name, revenue]) => ({
          name,
          revenue,
        })),
      );
    }

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split("T")[0];
    });

    const revenueByDate: Record<string, number> = {};
    orders.forEach((order) => {
      const date = order.created_at.split("T")[0];
      revenueByDate[date] =
        (revenueByDate[date] || 0) + Number(order.total_amount);
    });

    setRevenueOverTime(
      last30Days.map((date) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: revenueByDate[date] || 0,
      })),
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Revenue Analytics</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{revenueData.total_revenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{revenueData.revenue_this_month.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{revenueData.revenue_this_week.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Booking</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{revenueData.average_booking_amount.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueOverTime}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Sport</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueBySport}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(142, 76%, 36%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Venue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByVenue}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="hsl(142, 76%, 36%)"
                      dataKey="revenue"
                    >
                      {revenueByVenue.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
