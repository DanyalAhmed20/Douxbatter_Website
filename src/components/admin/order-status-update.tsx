'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ORDER_STATUS_CONFIG } from '@/lib/order-utils';
import type { OrderStatus } from '@/lib/types';

interface OrderStatusUpdateProps {
  orderId: number;
  currentStatus: OrderStatus;
  currentNotes: string | null;
  onUpdate: (status: OrderStatus, notes: string) => Promise<void>;
}

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
];

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  currentNotes,
  onUpdate,
}: OrderStatusUpdateProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState(currentNotes || '');
  const [isLoading, setIsLoading] = useState(false);

  const hasChanges = status !== currentStatus || notes !== (currentNotes || '');

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate(status, notes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Order Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => {
              const config = ORDER_STATUS_CONFIG[s];
              return (
                <SelectItem key={s} value={s}>
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-').split(' ')[0]}`}
                    />
                    {config.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Admin Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes about this order..."
          rows={3}
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={!hasChanges || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
}
