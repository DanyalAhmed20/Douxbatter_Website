'use client';

import { Package, MapPin, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/lib/order-utils';
import type { Order, OrderItem, OrderStatus, PaymentStatus } from '@/lib/types';

interface OrderDetailsProps {
  order: {
    reference_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string | null;
    city: string;
    delivery_address: string;
    delivery_type: string;
    delivery_date: Date | string;
    delivery_time_slot: string;
    subtotal: number;
    total: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    created_at: Date | string;
    items: Array<{
      id: number;
      product_name: string;
      variant_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  };
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.payment_status];

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Order Reference</p>
          <p className="text-xl font-bold">{order.reference_number}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          <Badge className={paymentConfig.color}>{paymentConfig.label}</Badge>
        </div>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.variant_name} x{item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium">{Number(item.total_price).toFixed(2)} AED</p>
            </div>
          ))}
          <div className="border-t pt-3 mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{Number(order.subtotal).toFixed(2)} AED</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{Number(order.total).toFixed(2)} AED</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{formatDate(order.delivery_date)}</p>
              <p className="text-muted-foreground">Delivery Date</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{order.delivery_time_slot}</p>
              <p className="text-muted-foreground">Time Slot</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{order.city}</p>
              <p className="text-muted-foreground">{order.delivery_address}</p>
              <Badge variant="outline" className="mt-1 text-xs capitalize">
                {order.delivery_type} delivery
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span>{order.customer_phone}</span>
          </div>
          {order.customer_email && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{order.customer_email}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
