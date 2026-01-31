'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { OrderStatus, PaymentStatus } from '@/lib/types';

type OrderFiltersProps = {
  status: OrderStatus | '';
  onStatusChange: (status: OrderStatus | '') => void;
  paymentStatus: PaymentStatus | '';
  onPaymentStatusChange: (status: PaymentStatus | '') => void;
};

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
  onStatusChange,
  paymentStatus,
  onPaymentStatusChange,
}: OrderFiltersProps) {
  const hasFilters = status || paymentStatus;

  const clearFilters = () => {
    onStatusChange('');
    onPaymentStatusChange('');
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="w-40">
        <Select
          value={status || 'all'}
          onValueChange={(val) => onStatusChange(val === 'all' ? '' : val as OrderStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Order status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-40">
        <Select
          value={paymentStatus || 'all'}
          onValueChange={(val) => onPaymentStatusChange(val === 'all' ? '' : val as PaymentStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
