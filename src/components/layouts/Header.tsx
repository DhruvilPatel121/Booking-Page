import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  Home,
  MapPin,
  Calendar,
  Trophy,
  Heart,
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin");

  const navLinks = [
    { to: "/", label: "Home", icon: Home, showWhen: !isAdminRoute },
    { to: "/venues", label: "Venues", icon: MapPin, showWhen: !isAdminRoute },
    {
      to: "/booking",
      label: "Book Now",
      icon: Calendar,
      showWhen: !isAdminRoute,
    },
    {
      to: "/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      showWhen: !isAdminRoute,
    },
    {
      to: "/favorites",
      label: "Favorites",
      icon: Heart,
      showWhen: !isAdminRoute && !!user,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-lg md:text-xl font-semibold text-foreground hover:text-primary transition-colors"
        >
          Sports Booking
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {!isAdminRoute && (
            <>
              <Link
                to="/venues"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                Venues
              </Link>
              <Link
                to="/booking"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                Book Now
              </Link>
              <Link
                to="/leaderboard"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                Leaderboard
              </Link>
              {user && (
                <Link
                  to="/favorites"
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  Favorites
                </Link>
              )}
            </>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {profile?.full_name || "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {profile?.full_name || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {profile?.role === "admin" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks
                  .filter((link) => link.showWhen)
                  .map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-accent"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                {profile?.role === "admin" && !isAdminRoute && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-accent"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="border-t border-border my-2"></div>
                {user ? (
                  <>
                    <div className="px-2 py-2 bg-accent rounded-md">
                      <p className="text-sm font-medium">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="justify-start gap-3"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    asChild
                    variant="default"
                    className="justify-start gap-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/login">
                      <User className="h-5 w-5" />
                      Login
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
