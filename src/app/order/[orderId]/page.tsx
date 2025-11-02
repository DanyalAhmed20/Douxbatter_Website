import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { OrderSummaryGenerator } from './order-summary';

interface OrderConfirmationPageProps {
  params: {
    orderId: string;
  };
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  // In a real app, you would fetch order details using the orderId
  const mockOrderDetails = {
    orderId: params.orderId,
    customerName: 'Jane Doe', // This would come from the checkout form or user session
    items: [
      { name: 'Chocolate Lava Cake', quantity: 2 },
      { name: 'Classic Chocolate Chip Cookies', quantity: 1 },
    ],
    totalAmount: 32.0,
    estimatedDelivery: '3-5 business days',
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
            <CheckCircle className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4 font-headline text-3xl">Thank You for Your Order!</CardTitle>
          <CardDescription className="text-lg">
            Your sweet treats are on their way.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Your order ID is:{' '}
            <span className="font-mono font-medium text-foreground">{params.orderId}</span>
          </p>
          
          <OrderSummaryGenerator orderData={mockOrderDetails} />

          <Button asChild variant="outline">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
