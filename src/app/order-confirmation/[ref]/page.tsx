import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OrderTracker, OrderDetails } from '@/components/order';
import { generateCustomerWhatsAppUrl } from '@/lib/whatsapp';
import { getOrderByReference } from '@/lib/order-server';

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const order = await getOrderByReference(ref);

  if (!order) {
    notFound();
  }

  const whatsappUrl = generateCustomerWhatsAppUrl(order.referenceNumber);

  return (
    <div className="container max-w-2xl py-8 px-4">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We'll start preparing it right away.
        </p>
      </div>

      {/* Order Reference */}
      <Card className="mb-6">
        <CardContent className="py-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
          <p className="text-2xl font-mono font-bold">{order.referenceNumber}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Save this reference to track your order
          </p>
        </CardContent>
      </Card>

      {/* Order Tracker */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <OrderTracker status={order.status} />
        </CardContent>
      </Card>

      {/* Order Details */}
      <OrderDetails order={order} showCustomerDetails={false} />

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-8">
        <Button asChild>
          <Link href="/track-order">Track Your Order</Link>
        </Button>
        <Button variant="outline" asChild>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Us on WhatsApp
          </a>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
