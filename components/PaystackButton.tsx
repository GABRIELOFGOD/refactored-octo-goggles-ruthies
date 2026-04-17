'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PaystackButtonProps {
  amount: number; // in kobo (smallest currency unit)
  email: string;
  orderNumber: string;
  onSuccess: (reference: string) => void;
  disabled?: boolean;
}

export default function PaystackButton({
  amount,
  email,
  orderNumber,
  onSuccess,
  disabled = false,
}: PaystackButtonProps) {
  const router = useRouter();

  const initializePayment = () => {
    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount,
      ref: orderNumber,
      onClose: () => {
        toast.error('Payment window closed');
      },
      onSuccess: (response: any) => {
        // Call backend to verify payment
        verifyPayment(response.reference);
      },
    });

    handler.openIframe();
  };

  const verifyPayment = async (reference: string) => {
    try {
      const res = await fetch(`/api/payment/verify?reference=${reference}`, {
        method: 'GET',
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Payment successful!');
        onSuccess(reference);
      } else {
        toast.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Payment verification failed');
    }
  };

  return (
    <>
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="lazyOnload"
      />
      <Button
        onClick={initializePayment}
        disabled={disabled || amount <= 0}
        className="w-full bg-secondary text-light-bg hover:bg-secondary/90 py-6 text-lg font-semibold"
      >
        Pay ₦{(amount / 100).toLocaleString()}
      </Button>
    </>
  );
}
