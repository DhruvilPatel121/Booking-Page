import { CheckCircle, XCircle } from 'lucide-react';

export interface PaymentToastProps {
  type: 'success' | 'error';
  message: string;
  error?: string;
}

export function PaymentToast({ type, message, error }: PaymentToastProps) {
  if (type === 'success') {
    return (
      <div className="flex items-start gap-4 bg-green-500 text-white p-6 rounded-xl shadow-2xl min-w-[320px]">
        <CheckCircle className="w-8 h-8 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-bold text-lg mb-1">Payment Successful!</div>
          <div className="text-base opacity-90">{message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 bg-red-500 text-white p-6 rounded-xl shadow-2xl min-w-[320px]">
      <XCircle className="w-8 h-8 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="font-bold text-lg mb-1">Payment Failed!</div>
        <div className="text-base opacity-90">{message}</div>
        {error && (
          <div className="text-sm mt-2 opacity-80 bg-red-600/50 p-2 rounded">Error: {error}</div>
        )}
      </div>
    </div>
  );
}
