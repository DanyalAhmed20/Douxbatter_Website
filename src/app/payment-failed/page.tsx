'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <div className="container max-w-md py-16 px-4 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
      <p className="text-muted-foreground mb-6">
        Unfortunately, your payment could not be processed. Please try again or contact us for assistance.
      </p>

      {ref && (
        <p className="text-sm text-muted-foreground mb-6">
          Order Reference: <span className="font-mono">{ref}</span>
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link href="/checkout">Try Again</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return to Menu</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
