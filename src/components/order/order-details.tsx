'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Order } from '@/lib/types';
import { formatCurrency, formatDate, ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/lib/order-utils';
import { cn } from '@/lib/utils';

type OrderDetailsProps = {
  order: Order;
  showCustomerDetails?: boolean;
};

export function OrderDetails({ order, showCustomerDetails = true }: OrderDetailsProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];

  return (
    <div className="space-y-6">
      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge className={cn('text-sm', statusConfig.color)}>
          {statusConfig.label}
        </Badge>
        <Badge className={cn('text-sm', paymentConfig.color)}>
          Payment: {paymentConfig.label}
        </Badge>
      </div>

      {/* Customer Details */}
      {showCustomerDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{order.customerPhone}</span>
            </div>
            {order.customerEmail && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{order.customerEmail}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delivery Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">City</span>
            <span className="font-medium">{order.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Address</span>
            <span className="font-medium text-right max-w-[60%]">
              {order.deliveryAddress}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Type</span>
            <span className="font-medium capitalize">{order.deliveryType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Date</span>
            <span className="font-medium">{formatDate(order.deliveryDate)}</span>
          </div>
          {order.deliveryTimeSlot && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Slot</span>
              <span className="font-medium">{order.deliveryTimeSlot}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-muted-foreground">
                    {' '}({item.variantName}) x{item.quantity}
                  </span>
                  {item.selectedSauces && item.selectedSauces.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Sauces: {item.selectedSauces.join(', ')}
                    </div>
                  )}
                </div>
                <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{formatCurrency(order.total - order.subtotal)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
