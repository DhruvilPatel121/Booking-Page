import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { PayUService } from '@/services/payuService';

export default function PayUFailurePage() {
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

        // Always show failure toast for this page
        PayUService.showPaymentToast({
          status: 'failure',
          message: verificationResult.message || 'Payment failed'
        });
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

  const handleTryAgain = () => {
    navigate('/booking');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // Open email client or support page
    window.location.href = 'mailto:support@sportsbooking.com?subject=Payment Issue';
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent border-r-transparent animate-spin rounded-full mx-auto" />
            <p className="text-lg font-medium">Verifying payment status...</p>
            <p className="text-sm text-muted-foreground">Please wait while we check your payment</p>
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
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentDetails && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-medium">{paymentDetails.paymentId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">₹{paymentDetails.amount || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-red-600">{paymentDetails.message}</span>
                  </div>
                  {paymentDetails.error && (
                    <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-700">
                      <strong>Error Details:</strong> {paymentDetails.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Failure Reasons */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Possible Reasons for Failure
              </h3>
              <ul className="space-y-2 text-sm text-amber-700">
                <li>• Insufficient funds in your account</li>
                <li>• Incorrect card details or expired card</li>
                <li>• Bank declined the transaction</li>
                <li>• Network connectivity issues</li>
                <li>• Incorrect payment information</li>
                <li>• Daily transaction limit exceeded</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Don't worry! Your payment was not processed, but you can try again.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleTryAgain} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Payment Again
                </Button>
                <Button variant="outline" onClick={handleGoHome} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Still having issues? We're here to help!
                </p>
                <Button 
                  variant="ghost" 
                  onClick={handleContactSupport}
                  className="text-sm"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
