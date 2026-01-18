'use client';

import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { useCart } from '@/components/cart/cart-provider';

export default function CheckoutPage() {
  const { items } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Checkout</h1>
          {items.length > 0 && (
            <span className="text-muted-foreground">
              ({items.reduce((sum, item) => sum + item.quantity, 0)} items)
            </span>
          )}
        </div>

        <CheckoutForm />
      </main>
    </div>
  );
}
