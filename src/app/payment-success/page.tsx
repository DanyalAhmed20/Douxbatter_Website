'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/components/cart';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const ref = searchParams.get('ref');

  useEffect(() => {
    // Clear the cart after successful payment
    clearCart();

    // Redirect to order confirmation after a short delay
    const timer = setTimeout(() => {
      if (ref) {
        router.push(`/order-confirmation/${ref}`);
      } else {
        router.push('/');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [ref, router, clearCart]);

  return (
    <div className="container max-w-md py-16 px-4 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground mb-6">
        Thank you for your order. You will be redirected shortly.
      </p>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Redirecting to order confirmation...
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
