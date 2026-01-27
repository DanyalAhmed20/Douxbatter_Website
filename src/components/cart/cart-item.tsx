'use client';

import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './cart-provider';
import type { CartItem as CartItemType } from '@/lib/types';
import { formatCurrency } from '@/lib/order-utils';

type CartItemProps = {
  item: CartItemType;
};

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const variant = item.product.variants.find((v) => v.id === item.variantId);
  const price = variant?.price || 0;
  const totalPrice = price * item.quantity;

  return (
    <div className="flex gap-4 py-4 border-b">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
        <p className="text-sm text-muted-foreground">{variant?.name}</p>
        {item.selectedSauces && item.selectedSauces.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Sauces: {item.selectedSauces.join(', ')}
          </p>
        )}
        <p className="text-sm font-medium mt-1">{formatCurrency(totalPrice)}</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => removeItem(item.id)}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
