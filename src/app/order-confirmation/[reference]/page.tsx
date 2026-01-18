import Link from 'next/link';
import { CheckCircle, Package, MessageCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import pool, { OrderRow, OrderItemRow } from '@/lib/db';
import { formatDate, ORDER_STATUS_CONFIG } from '@/lib/order-utils';
import { generateCustomerWhatsAppUrl } from '@/lib/whatsapp';
import type { RowDataPacket } from 'mysql2';

async function getOrder(reference: string) {
  try {
    const [orders] = await pool.execute<(OrderRow & RowDataPacket)[]>(
      'SELECT * FROM orders WHERE reference_number = ?',
      [reference]
    );

    if (orders.length === 0) {
      return null;
    }

    const order = orders[0];

    const [items] = await pool.execute<(OrderItemRow & RowDataPacket)[]>(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );

    return {
      ...order,
      items,
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = await getOrder(reference);

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find an order with reference #{reference}
          </p>
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const whatsAppUrl = generateCustomerWhatsAppUrl(order.reference_number);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We&apos;ll start preparing your treats soon.
          </p>
        </div>

        {/* Order Reference */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Order Reference</p>
                <p className="text-xl font-bold">{order.reference_number}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product_name} ({item.variant_name}) x{item.quantity}
                </span>
                <span className="font-medium">{Number(item.total_price).toFixed(2)} AED</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{Number(order.total).toFixed(2)} AED</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Date</span>
              <span>{formatDate(order.delivery_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Slot</span>
              <span>{order.delivery_time_slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Type</span>
              <span className="capitalize">{order.delivery_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">City</span>
              <span>{order.city}</span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-muted-foreground block mb-1">Address</span>
              <span>{order.delivery_address}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href={`/track-order?ref=${order.reference_number}`}>
              Track Your Order
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full" size="lg">
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Us on WhatsApp
            </a>
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
