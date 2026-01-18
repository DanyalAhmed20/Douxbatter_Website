'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Package, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderTable } from '@/components/admin/order-table';
import { OrderFilters } from '@/components/admin/order-filters';
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

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');

  const fetchOrders = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      if (status) params.set('status', status);
      if (paymentStatus) params.set('payment_status', paymentStatus);

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [status, paymentStatus]);

  useEffect(() => {
    fetchOrders(1);
  }, [status, paymentStatus, fetchOrders]);

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Orders</h1>
            <p className="text-sm text-muted-foreground">
              {pagination.total} total orders
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(pagination.page)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <OrderFilters
        status={status}
        paymentStatus={paymentStatus}
        onStatusChange={setStatus}
        onPaymentStatusChange={setPaymentStatus}
      />

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Orders Table */}
          <OrderTable orders={orders} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
