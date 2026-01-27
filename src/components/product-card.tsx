'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageCarousel } from './image-carousel';
import { AddToCartButton } from '@/components/cart';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/order-utils';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const priceDisplay =
    minPrice === maxPrice
      ? formatCurrency(minPrice)
      : `From ${formatCurrency(minPrice)}`;

  return (
    <Card className="overflow-hidden h-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 active:scale-[0.98] touch-manipulation">
      <ImageCarousel images={product.images} alt={product.name} />

      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base sm:text-lg leading-tight">{product.name}</h3>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {product.category}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="mt-auto">
          <p className="font-semibold text-primary text-lg mb-3">{priceDisplay}</p>

          {/* Variant options preview */}
          {product.variants.length > 1 && (
            <div className="text-xs text-muted-foreground mb-3">
              {product.variants.map((v) => v.name).join(' | ')}
            </div>
          )}

          <AddToCartButton product={product} />
        </div>
      </CardContent>
    </Card>
  );
}
