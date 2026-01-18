'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, User, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { OrderStatusUpdate } from '@/components/admin/order-status-update';
import { OrderTracker } from '@/components/order/order-tracker';
import { formatDate, formatCurrency, ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/lib/order-utils';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import type { OrderStatus, PaymentStatus } from '@/lib/types';

type OrderDetail = {
  id: number;
  reference_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  city: string;
  delivery_address: string;
  delivery_type: string;
  delivery_date: string;
  delivery_time_slot: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  ziina_payment_id: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: number;
    product_id: string;
    product_name: string;
    variant_id: string;
    variant_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order');
      }

      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (status: OrderStatus, notes: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      // Refresh order data
      await fetchOrder();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      window.location.href = '/admin/dashboard/orders';
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete order');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/dashboard/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.payment_status];

  // Create a minimal order object for WhatsApp
  const whatsAppOrder = {
    id: order.id,
    referenceNumber: order.reference_number,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerEmail: order.customer_email || undefined,
    city: order.city as any,
    deliveryAddress: order.delivery_address,
    deliveryType: order.delivery_type as any,
    deliveryDate: order.delivery_date,
    deliveryTimeSlot: order.delivery_time_slot as any,
    items: order.items.map(item => ({
      productId: item.product_id,
      productName: item.product_name,
      variantId: item.variant_id,
      variantName: item.variant_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    })),
    subtotal: order.subtotal,
    total: order.total,
    status: order.status,
    paymentStatus: order.payment_status,
    createdAt: order.created_at,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/admin/dashboard/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{order.reference_number}</h1>
          <p className="text-sm text-muted-foreground">
            Created {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          <Badge className={paymentConfig.color}>{paymentConfig.label}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTracker status={order.status} />
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variant_name} &times; {item.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.unit_price)} each
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.total_price)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(Number(order.total))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Delivery Date</p>
                  <p className="font-medium">{formatDate(order.delivery_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time Slot</p>
                  <p className="font-medium">{order.delivery_time_slot}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">City</p>
                  <p className="font-medium">{order.city}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Delivery Type</p>
                  <p className="font-medium capitalize">{order.delivery_type}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full Address</p>
                <p className="font-medium">{order.delivery_address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <a href={`tel:${order.customer_phone}`} className="font-medium text-primary hover:underline">
                  {order.customer_phone}
                </a>
              </div>
              {order.customer_email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <a href={`mailto:${order.customer_email}`} className="font-medium text-primary hover:underline">
                    {order.customer_email}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Order</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdate
                orderId={order.id}
                currentStatus={order.status}
                currentNotes={order.admin_notes}
                onUpdate={handleStatusUpdate}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <a
                  href={generateWhatsAppUrl(whatsAppOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Send WhatsApp
                </a>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete order {order.reference_number}.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Payment Info */}
          {order.ziina_payment_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">Ziina Payment ID</p>
                <p className="font-mono text-xs break-all">{order.ziina_payment_id}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
