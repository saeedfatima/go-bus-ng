import { useState } from 'react';
import { api, currentBackend } from '@/services/api';
import type { PaystackInitResult, PaystackVerifyResult } from '@/services/api/types';

export const usePaystack = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaystackAvailable = currentBackend === 'django' && !!api.payments;

  const initializePayment = async (
    bookingId: string,
    email: string,
    amount: number
  ): Promise<PaystackInitResult | null> => {
    if (!api.payments) {
      setError('Payment service not available');
      return null;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const result = await api.payments.initializePayment(bookingId, email, amount);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
      return null;
    } finally {
      setIsInitializing(false);
    }
  };

  const verifyPayment = async (reference: string): Promise<PaystackVerifyResult | null> => {
    if (!api.payments) {
      setError('Payment service not available');
      return null;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await api.payments.verifyPayment(reference);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to verify payment');
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isPaystackAvailable,
    initializePayment,
    verifyPayment,
    isInitializing,
    isVerifying,
    error,
  };
};
