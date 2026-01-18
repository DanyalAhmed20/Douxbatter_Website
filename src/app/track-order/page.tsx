'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2, Package, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { OrderTracker } from '@/components/order/order-tracker';
import { OrderDetails } from '@/components/order/order-details';
import { generateCustomerWhatsAppUrl } from '@/lib/whatsapp';
import type { OrderStatus, PaymentStatus } from '@/lib/types';

type OrderData = {
  reference_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  city: string;
  delivery_address: string;
  delivery_type: string;
  delivery_date: string;
  delivery_time_slot: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  items: Array<{
    id: number;
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRef = searchParams.get('ref') || '';

  const [reference, setReference] = useState(initialRef);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (ref?: string) => {
    const searchRef = ref || reference.trim();
    if (!searchRef) {
      setError('Please enter an order reference');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/${searchRef}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Order not found');
        return;
      }

      setOrder(data);
      // Update URL without navigation
      router.replace(`/track-order?ref=${searchRef}`, { scroll: false });
    } catch (err) {
      setError('Failed to fetch order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search if reference is in URL
  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Track Your Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter order reference (e.g., DB-20260118-0001)"
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Track</span>
            </Button>
          </form>
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Order Status */}
      {order && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTracker status={order.status} />
            </CardContent>
          </Card>

          <OrderDetails order={order} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline" className="flex-1">
              <a
                href={generateCustomerWhatsAppUrl(order.reference_number)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </>
      )}

      {/* No order searched yet */}
      {!order && !isLoading && !error && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-2">Enter your order reference</h2>
          <p className="text-sm text-muted-foreground">
            You can find your order reference in your confirmation email or on the confirmation page.
          </p>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <TrackOrderContent />
        </Suspense>
      </main>
    </div>
  );
}
