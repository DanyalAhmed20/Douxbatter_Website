'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, formatDate, formatCurrency } from '@/lib/order-utils';
import type { OrderStatus, PaymentStatus } from '@/lib/types';

type OrderSummary = {
  id: number;
  reference_number: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  delivery_date: string;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  item_count: number;
};

interface OrderTableProps {
  orders: OrderSummary[];
}

export function OrderTable({ orders }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No orders found
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="hidden md:table-cell">City</TableHead>
            <TableHead className="hidden lg:table-cell">Delivery</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Payment</TableHead>
            <TableHead className="w-[120px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status];
            const paymentConfig = PAYMENT_STATUS_CONFIG[order.payment_status];

            return (
              <TableRow key={order.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{order.reference_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.item_count} items
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {order.city}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {formatDate(order.delivery_date)}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(Number(order.total))}
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig.color} variant="secondary">
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className={paymentConfig.color} variant="secondary">
                    {paymentConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button asChild variant="default" size="sm">
                    <Link href={`/admin/dashboard/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
