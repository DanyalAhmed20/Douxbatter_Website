'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './cart-provider';
import type { CartItem as CartItemType } from '@/lib/types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const variant = item.product.variants.find((v) => v.id === item.variantId);
  const price = variant?.price || 0;
  const totalPrice = price * item.quantity;

  return (
    <div className="flex gap-3 py-4 border-b last:border-b-0">
      {/* Product Image */}
      {item.product.images[0] && (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.product.images[0]}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-tight truncate">
          {item.product.name}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {variant?.name}
        </p>
        {item.selectedSauces && item.selectedSauces.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Sauces: {item.selectedSauces.join(', ')}
          </p>
        )}
        <p className="text-sm font-semibold text-primary mt-1">
          {totalPrice.toFixed(2)} AED
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-6 text-center">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
