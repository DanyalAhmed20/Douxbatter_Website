'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Home, ShoppingCart, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref');

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
        <AlertCircle className="h-10 w-10 text-red-600" />
      </div>

      <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
      <p className="text-muted-foreground mb-6">
        Unfortunately, your payment could not be processed. This may be due to insufficient funds,
        an expired card, or a temporary issue with the payment provider.
      </p>

      {reference && (
        <p className="text-sm text-muted-foreground mb-6">
          Order Reference: <span className="font-medium">{reference}</span>
        </p>
      )}

      <div className="space-y-3 max-w-xs mx-auto">
        <Button asChild className="w-full">
          <Link href="/checkout">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-8">
        If the problem persists, please{' '}
        <a
          href="https://wa.me/971507467480"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          contact us on WhatsApp
        </a>
        {' '}for assistance.
      </p>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-md">
        <Suspense
          fallback={
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          }
        >
          <PaymentFailedContent />
        </Suspense>
      </main>
    </div>
  );
}
