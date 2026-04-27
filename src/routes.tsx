import type { ReactNode } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import VenuesPage from "./pages/VenuesPage";
import VenueDetailsPage from "./pages/VenueDetailsPage";
import FavoritesPage from "./pages/FavoritesPage";
import BookingPage from "./pages/BookingPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SportsManagement from "./pages/admin/SportsManagement";
import VenuesManagement from "./pages/admin/VenuesManagement";
import SlotsManagement from "./pages/admin/SlotsManagement";
import BookingsManagement from "./pages/admin/BookingsManagement";
import PaymentStatusManagement from "./pages/admin/PaymentStatusManagement";
import LeaderboardManagement from "./pages/admin/LeaderboardManagement";
import RevenueAnalytics from "./pages/admin/RevenueAnalytics";

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: "Home",
    path: "/",
    element: <HomePage />,
    public: true,
  },
  {
    name: "Login",
    path: "/login",
    element: <LoginPage />,
    public: true,
  },
  {
    name: "Venues",
    path: "/venues",
    element: <VenuesPage />,
    public: true,
  },
  {
    name: "Venue Details",
    path: "/venues/:id",
    element: <VenueDetailsPage />,
    public: true,
  },
  {
    name: "Favorites",
    path: "/favorites",
    element: <FavoritesPage />,
    public: false,
  },
  {
    name: "Booking",
    path: "/booking",
    element: <BookingPage />,
    public: true,
  },
  {
    name: "Payment Success",
    path: "/payment-success",
    element: <PaymentSuccessPage />,
    public: true,
  },
  {
    name: "Leaderboard",
    path: "/leaderboard",
    element: <LeaderboardPage />,
    public: true,
  },
  {
    name: "Admin Dashboard",
    path: "/admin",
    element: <AdminDashboard />,
    public: false,
  },
  {
    name: "Sports Management",
    path: "/admin/sports",
    element: <SportsManagement />,
    public: false,
  },
  {
    name: "Venues Management",
    path: "/admin/venues",
    element: <VenuesManagement />,
    public: false,
  },
  {
    name: "Slots Management",
    path: "/admin/slots",
    element: <SlotsManagement />,
    public: false,
  },
  {
    name: "Bookings Management",
    path: "/admin/bookings",
    element: <BookingsManagement />,
    public: false,
  },
  {
    name: "Payment Status",
    path: "/admin/payments",
    element: <PaymentStatusManagement />,
    public: false,
  },
  {
    name: "Leaderboard Management",
    path: "/admin/leaderboard",
    element: <LeaderboardManagement />,
    public: false,
  },
  {
    name: "Revenue Analytics",
    path: "/admin/revenue",
    element: <RevenueAnalytics />,
    public: false,
  },
];
