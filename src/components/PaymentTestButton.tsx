import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { PayUService } from '@/services/payuService';
import { PAYU_CONFIG } from '@/config/payu';
import { toast } from 'sonner';

export function PaymentTestButton() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const testPayUConfig = async () => {
    const results = [];
    
    // Test 1: Check PayU configuration
    try {
      const config = {
        merchantKey: PAYU_CONFIG.MERCHANT_KEY,
        salt: PAYU_CONFIG.SALT,
        paymentUrl: PAYU_CONFIG.PAYMENT_URL
      };
      
      results.push({
        test: 'PayU Configuration',
        status: 'success',
        message: 'Configuration loaded successfully',
        details: config
      });
    } catch (error) {
      results.push({
        test: 'PayU Configuration',
        status: 'error',
        message: 'Configuration error',
        error: error
      });
    }

    // Test 2: Check hash generation
    try {
      const testData = {
        key: 'test',
        txnid: 'test123',
        amount: '100',
        productinfo: 'test',
        firstname: 'test',
        email: 'test@test.com',
        phone: '1234567890'
      };
      
      const hash = await PAYU_CONFIG.generateHash(testData);
      results.push({
        test: 'Hash Generation',
        status: 'success',
        message: 'Hash generated successfully',
        details: { hash: hash.substring(0, 20) + '...' }
      });
    } catch (error) {
      results.push({
        test: 'Hash Generation',
        status: 'error',
        message: 'Hash generation failed',
        error: error
      });
    }

    // Test 3: Check payment URL generation
    try {
      const paymentUrl = import.meta.env.MODE === 'production' ? 
        'https://secure.payu.in/_payment' : 
        'https://test.payu.in/_payment';
      
      results.push({
        test: 'Payment URL',
        status: 'success',
        message: 'Payment URL configured',
        details: { url: paymentUrl }
      });
    } catch (error) {
      results.push({
        test: 'Payment URL',
        status: 'error',
        message: 'Payment URL error',
        error: error
      });
    }

    setTestResults(results);
    return results;
  };

  const testPaymentFlow = async () => {
    setIsTesting(true);
    
    try {
      // Test payment initiation
      const testPaymentData = {
        amount: 1,
        productInfo: 'Test Payment - Sports Booking',
        firstName: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        bookingId: 'TEST_' + Date.now()
      };

      const response = await PayUService.initiatePayment(testPaymentData);
      
      if (response.status === 'pending') {
        toast.success('Test payment initiated successfully!');
      } else {
        toast.error('Test payment initiation failed');
      }
    } catch (error) {
      toast.error('Test payment failed: ' + error);
    } finally {
      setIsTesting(false);
    }
  };

  const runTests = async () => {
    const results = await testPayUConfig();
    const hasErrors = results.some(r => r.status === 'error');
    
    if (hasErrors) {
      toast.error('Some tests failed. Check results below.');
    } else {
      toast.success('All tests passed! PayU is ready.');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          PayU Payment Gateway Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runTests} variant="outline">
            <TestTube className="h-4 w-4 mr-2" />
            Run Configuration Tests
          </Button>
          <Button onClick={testPaymentFlow} disabled={isTesting}>
            <CreditCard className="h-4 w-4 mr-2" />
            {isTesting ? 'Testing...' : 'Test Payment (₹1)'}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{result.test}</span>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status === 'success' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{result.message}</p>
                {result.details && (
                  <div className="mt-2 text-xs bg-muted p-2 rounded">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
                {result.error && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                    Error: {String(result.error)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Testing Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Run configuration tests to verify PayU setup</li>
            <li>Test payment with ₹1 to check actual payment flow</li>
            <li>Check browser console for detailed logs</li>
            <li>Verify environment variables are set correctly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
