'use client';

import { useState } from 'react';
import { Search, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderTracker, OrderDetails } from '@/components/order';
import { generateCustomerWhatsAppUrl } from '@/lib/whatsapp';
import type { Order } from '@/lib/types';

export default function TrackOrderPage() {
  const [reference, setReference] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reference.trim()) return;

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/${reference.trim()}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found. Please check your reference number.');
        }
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">
          Enter your order reference number to see the current status
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="DB-20240101-0001"
              className="font-mono"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 bg-destructive/15 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Result */}
      {order && (
        <div className="space-y-6">
          {/* Reference */}
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
              <p className="text-xl font-mono font-bold">{order.referenceNumber}</p>
            </CardContent>
          </Card>

          {/* Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTracker status={order.status} />
            </CardContent>
          </Card>

          {/* Details */}
          <OrderDetails order={order} showCustomerDetails={false} />

          {/* Contact */}
          <Button variant="outline" className="w-full" asChild>
            <a
              href={generateCustomerWhatsAppUrl(order.referenceNumber)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Need Help? Contact Us
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
