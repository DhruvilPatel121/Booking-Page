import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Receipt } from 'lucide-react';
import { PayUService } from '@/services/payuService';

export default function PayUSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment response from URL parameters
        const response: any = {};
        searchParams.forEach((value, key) => {
          response[key] = value;
        });

        // Verify payment with PayU asynchronously
        const verificationResult = await PayUService.verifyPaymentAsync(response);
        setPaymentDetails(verificationResult);

        if (verificationResult.status === 'success') {
          // Store payment details
          const bookingId = response.txnid?.replace('TXN', '');
          if (bookingId) {
            PayUService.storePaymentDetails(
              {
                amount: parseFloat(response.amount || '0'),
                productInfo: response.productinfo || '',
                firstName: response.firstname || '',
                email: response.email || '',
                phone: response.phone || '',
                bookingId
              },
              verificationResult
            );
          }

          // Show success toast
          PayUService.showPaymentToast(verificationResult);
        } else {
          // Show failure toast
          PayUService.showPaymentToast(verificationResult);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        PayUService.showPaymentToast({
          status: 'failure',
          message: 'Payment verification failed'
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleViewBooking = () => {
    navigate('/bookings');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent border-r-transparent animate-spin rounded-full mx-auto" />
            <p className="text-lg font-medium">Verifying payment...</p>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your payment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-medium">{paymentDetails.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium text-green-600">₹{paymentDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-green-600">{paymentDetails.message}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your booking has been confirmed! You will receive a confirmation email shortly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleViewBooking} className="flex-1">
                  <Receipt className="w-4 h-4 mr-2" />
                  View My Bookings
                </Button>
                <Button variant="outline" onClick={handleGoHome} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
