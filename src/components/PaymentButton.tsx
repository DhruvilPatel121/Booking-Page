import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Smartphone, Wallet, Building } from 'lucide-react';
import { PayUService, PayUPaymentData } from '@/services/payuService';
import { toast } from 'sonner';

interface PaymentButtonProps {
  amount: number;
  bookingId: string;
  sportName: string;
  venueName: string;
  slotTime: string;
  slotDate: string;
  firstName: string;
  email: string;
  phone: string;
  onPaymentComplete?: (success: boolean) => void;
}

export function PaymentButton({
  amount,
  bookingId,
  sportName,
  venueName,
  slotTime,
  slotDate,
  firstName,
  email,
  phone,
  onPaymentComplete
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentData: PayUPaymentData = {
    amount,
    productInfo: `Sports Booking - ${sportName} at ${venueName}`,
    firstName,
    email,
    phone,
    bookingId
  };

  const [selectedMode, setSelectedMode] = useState('CC');

  const handlePayment = async () => {
    // Validate required fields
    if (!paymentData.firstName || !paymentData.email || !paymentData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paymentData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone (basic validation for India)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(paymentData.phone)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsProcessing(true);

    try {
      // Initiate payment
      const response = await PayUService.initiatePayment(paymentData);
      
      if (response.status === 'failure') {
        PayUService.showPaymentToast(response);
        onPaymentComplete?.(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment initialization failed. Please try again.');
      onPaymentComplete?.(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Payment
        </CardTitle>
        <CardDescription>
          Secure payment powered by PayU
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h3 className="font-semibold">Booking Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span>Sport:</span>
            <span className="font-medium">{sportName}</span>
            <span>Venue:</span>
            <span className="font-medium">{venueName}</span>
            <span>Date:</span>
            <span className="font-medium">{slotDate}</span>
            <span>Time:</span>
            <span className="font-medium">{slotTime}</span>
            <span>Amount:</span>
            <span className="font-bold text-primary">₹{amount}</span>
          </div>
        </div>

          <div>
            <Label htmlFor="paymentMode">Payment Mode</Label>
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger disabled={isProcessing}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CC">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit Card
                  </div>
                </SelectItem>
                <SelectItem value="UPI">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    UPI
                  </div>
                </SelectItem>
                <SelectItem value="NB">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Net Banking
                  </div>
                </SelectItem>
                <SelectItem value="WALLET">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Wallet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent border-r-transparent animate-spin rounded-full" />
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pay Now - ₹{amount}
              </div>
            )}
          </Button>

          {/* Security Note */}
          <div className="text-xs text-muted-foreground text-center mt-4">
            <p>🔒 Secure payment powered by PayU</p>
            <p>Your payment information is encrypted and secure</p>
          </div>
      </CardContent>
    </Card>
  );
}
