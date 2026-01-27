import { format, addDays, isAfter, setHours, setMinutes } from 'date-fns';
import type { OrderStatus, PaymentStatus } from './types';

// Format date in en-AE locale
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

// Format date with time
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

// Format currency as "XX.XX AED"
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} AED`;
}

// Get next 7 days for delivery, with 2PM cutoff for same-day
export function getDeliveryDateOptions(): { value: string; label: string; disabled?: boolean }[] {
  const options: { value: string; label: string; disabled?: boolean }[] = [];
  const now = new Date();
  const cutoffTime = setMinutes(setHours(now, 14), 0); // 2PM cutoff

  for (let i = 0; i < 7; i++) {
    const date = addDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    let label = format(date, 'EEE, MMM d');

    if (i === 0) {
      label = `Today, ${format(date, 'MMM d')}`;
      // Disable if after 2PM cutoff
      if (isAfter(now, cutoffTime)) {
        options.push({ value: dateStr, label, disabled: true });
        continue;
      }
    } else if (i === 1) {
      label = `Tomorrow, ${format(date, 'MMM d')}`;
    }

    options.push({ value: dateStr, label });
  }

  return options;
}

// Order status configuration
export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-purple-100 text-purple-800',
  },
  ready: {
    label: 'Ready',
    color: 'bg-green-100 text-green-800',
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-gray-100 text-gray-800',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
  },
};

// Payment status configuration
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800',
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
  },
};
