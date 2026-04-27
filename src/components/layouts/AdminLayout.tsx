import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  MapPin,
  Calendar,
  BookOpen,
  CreditCard,
  Award,
  TrendingUp,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/sports", label: "Sports", icon: Trophy },
  { path: "/admin/venues", label: "Venues", icon: MapPin },
  { path: "/admin/slots", label: "Slots", icon: Calendar },
  { path: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { path: "/admin/payments", label: "Payments", icon: CreditCard },
  { path: "/admin/leaderboard", label: "Leaderboard", icon: Award },
  { path: "/admin/revenue", label: "Revenue", icon: TrendingUp },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:block w-64 border-r border-border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
        </div>
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
