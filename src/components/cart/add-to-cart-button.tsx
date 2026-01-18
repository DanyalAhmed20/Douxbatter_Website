'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from './cart-provider';
import type { Product } from '@/lib/types';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const selectedVariantData = product.variants.find(
    (v) => v.id === selectedVariant
  );

  if (product.variants.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {product.variants.length > 1 ? (
        <div className="space-y-2">
          <Select value={selectedVariant} onValueChange={setSelectedVariant}>
            <SelectTrigger className="w-full text-xs sm:text-sm h-9">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {product.variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  <span className="flex items-center justify-between gap-2 w-full">
                    <span>{variant.name}</span>
                    <span className="text-muted-foreground">
                      {variant.price} AED
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
            disabled={!selectedVariant || isAdded}
          >
            {isAdded ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart - {selectedVariantData?.price} AED
              </>
            )}
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          className="w-full"
          size="sm"
          disabled={isAdded}
        >
          {isAdded ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart - {product.variants[0].price} AED
            </>
          )}
        </Button>
      )}
    </div>
  );
}
