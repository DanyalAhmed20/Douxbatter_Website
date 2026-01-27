'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <div className="container max-w-md py-16 px-4 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center">
          <Ban className="h-10 w-10 text-yellow-600" />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-muted-foreground mb-6">
        Your payment was cancelled. Your cart items are still saved if you'd like to complete your order.
      </p>

      {ref && (
        <p className="text-sm text-muted-foreground mb-6">
          Order Reference: <span className="font-mono">{ref}</span>
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link href="/checkout">Return to Checkout</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <PaymentCancelledContent />
    </Suspense>
  );
}
