/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-AE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format currency in AED
 */
export function formatCurrency(amount: number | string): string {
  return `${Number(amount).toFixed(2)} AED`;
}

/**
 * Get delivery date options (next 7 days, excluding today if past cutoff)
 */
export function getDeliveryDateOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const cutoffHour = 14; // 2 PM cutoff for same-day orders

  // Start from today or tomorrow based on cutoff
  const startDay = now.getHours() >= cutoffHour ? 1 : 0;

  for (let i = startDay; i < startDay + 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);

    const value = date.toISOString().slice(0, 10);
    const label = i === 0
      ? 'Today'
      : i === 1
        ? 'Tomorrow'
        : date.toLocaleDateString('en-AE', { weekday: 'long', month: 'short', day: 'numeric' });

    options.push({ value, label });
  }

  return options;
}

/**
 * Status display configuration
 */
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Order received, awaiting confirmation',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    description: 'Order confirmed, being prepared',
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-purple-100 text-purple-800',
    description: 'Your order is being prepared',
  },
  ready: {
    label: 'Ready',
    color: 'bg-green-100 text-green-800',
    description: 'Ready for delivery',
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-gray-100 text-gray-800',
    description: 'Order delivered successfully',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    description: 'Order was cancelled',
  },
} as const;

export const PAYMENT_STATUS_CONFIG = {
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
} as const;
