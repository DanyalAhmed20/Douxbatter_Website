'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            {product.category}
          </Badge>
        </div>
        {product.subcategory && (
          <p className="text-sm text-muted-foreground">{product.subcategory}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
        <div className="mt-auto space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Options
          </p>
          <div className="space-y-1.5">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between text-sm bg-secondary/50 rounded-md px-3 py-2"
              >
                <div className="flex-1">
                  <span className="font-medium">{variant.name}</span>
                  {variant.description && (
                    <span className="text-muted-foreground ml-1">
                      ({variant.description})
                    </span>
                  )}
                </div>
                <span className="font-semibold text-primary ml-2">
                  {variant.price} AED
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
