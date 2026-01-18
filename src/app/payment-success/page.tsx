'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { useCart } from '@/components/cart/cart-provider';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const reference = searchParams.get('ref');

  useEffect(() => {
    // Clear the cart on successful payment
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    // Redirect to order confirmation after a short delay
    if (reference) {
      const timer = setTimeout(() => {
        router.push(`/order-confirmation/${reference}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [reference, router]);

  if (!reference) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Reference Missing</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find your payment reference.
        </p>
        <Button asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground mb-2">
        Thank you for your order.
      </p>
      <p className="text-lg font-medium mb-6">
        Order Reference: <span className="text-primary">{reference}</span>
      </p>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Redirecting to order details...
      </div>

      <div className="space-y-3 max-w-xs mx-auto">
        <Button asChild className="w-full">
          <Link href={`/order-confirmation/${reference}`}>
            <Package className="h-4 w-4 mr-2" />
            View Order Details
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
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
          <PaymentSuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
