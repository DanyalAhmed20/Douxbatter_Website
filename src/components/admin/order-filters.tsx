'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OrderStatus, PaymentStatus } from '@/lib/types';

interface OrderFiltersProps {
  status: OrderStatus | '';
  paymentStatus: PaymentStatus | '';
  onStatusChange: (status: OrderStatus | '') => void;
  onPaymentStatusChange: (status: PaymentStatus | '') => void;
}

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
];

export function OrderFilters({
  status,
  paymentStatus,
  onStatusChange,
  onPaymentStatusChange,
}: OrderFiltersProps) {
  const hasFilters = status || paymentStatus;

  const clearFilters = () => {
    onStatusChange('');
    onPaymentStatusChange('');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={status || 'all'}
        onValueChange={(v) => onStatusChange(v === 'all' ? '' : v as OrderStatus)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Order Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={paymentStatus || 'all'}
        onValueChange={(v) => onPaymentStatusChange(v === 'all' ? '' : v as PaymentStatus)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Payment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payments</SelectItem>
          {PAYMENT_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
