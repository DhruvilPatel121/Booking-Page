import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/db/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { BookingWithDetails } from "@/types/types";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "verify_stripe_payment",
        {
          body: { sessionId },
        },
      );

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || error.message);
      }

      if (data?.data?.verified) {
        setVerified(true);
        await fetchBookingDetails();
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async () => {
    const { data: orderData } = await supabase
      .from("orders")
      .select("items")
      .eq("stripe_session_id", sessionId)
      .single();

    if (orderData?.items) {
      const items = orderData.items as Array<{ booking_id: string }>;
      if (items[0]?.booking_id) {
        const { data: bookingData } = await supabase
          .from("bookings")
          .select("*, slot:slots(*, sport:sports(*), venue:venues(*))")
          .eq("id", items[0].booking_id)
          .single();

        if (bookingData) {
          setBooking(bookingData);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Payment Failed</CardTitle>
            <CardDescription>Unable to verify your payment</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/booking">Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-primary" />
            </div>
            <CardTitle className="text-xl md:text-2xl">
              Booking Confirmed!
            </CardTitle>
            <CardDescription>Your payment was successful</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {booking && (
              <div className="space-y-4">
                <div className="p-4 bg-accent rounded-md space-y-3">
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="text-sm font-medium">Booking ID:</span>
                    <span className="text-sm font-mono">
                      {booking.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="text-sm font-medium">Sport:</span>
                    <span className="text-sm">{booking.slot?.sport?.name}</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="text-sm font-medium">Venue:</span>
                    <span className="text-sm">{booking.slot?.venue?.name}</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm">{booking.slot?.slot_date}</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="text-sm font-medium">Time:</span>
                    <span className="text-sm">
                      {booking.slot?.start_time} - {booking.slot?.end_time}
                    </span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-2">
                    <span className="text-sm font-medium">Amount Paid:</span>
                    <span className="text-sm font-semibold">
                      ₹{booking.booking_amount}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-4">
              <Button asChild className="flex-1">
                <Link to="/booking">Book Another</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/">Go Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
