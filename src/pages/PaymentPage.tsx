import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { PaymentButton } from '@/components/PaymentButton';
import { toast } from 'sonner';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  
  // Extract payment parameters from URL
  const bookingId = searchParams.get('bookingId') || '';
  const amount = searchParams.get('amount') || '0';
  const sport = searchParams.get('sport') || '';
  const venue = searchParams.get('venue') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Booking
        </Button>
        
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Complete Payment</CardTitle>
            <p className="text-muted-foreground">
              Secure payment powered by PayU
            </p>
          </CardHeader>
          <CardContent>
            <PaymentButton
              amount={parseFloat(amount)}
              bookingId={bookingId}
              sportName={decodeURIComponent(sport)}
              venueName={decodeURIComponent(venue)}
              slotTime={time}
              slotDate={date}
              onPaymentComplete={(success) => {
                if (success) {
                  toast.success('Payment completed! Your booking is confirmed.');
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
