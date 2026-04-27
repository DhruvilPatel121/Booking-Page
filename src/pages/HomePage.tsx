import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Trophy, Award } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Book Your Sports Venue
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Reserve your favorite sports venues with ease. Choose from multiple
            sports, select your preferred time slot, and pay securely online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/venues">Browse Venues</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/booking">Book Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-accent">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Easy Booking</CardTitle>
                <CardDescription>
                  Select your sport, date, and time slot in just a few clicks
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Trophy className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Multiple Sports</CardTitle>
                <CardDescription>
                  Choose from football, basketball, tennis, cricket, and more
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Track Performance</CardTitle>
                <CardDescription>
                  View leaderboards and track top players across all sports
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
