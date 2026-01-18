'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageCarousel } from './image-carousel';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Image Carousel */}
      <ImageCarousel images={product.images} productName={product.name} />

      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base sm:text-lg leading-tight">
            {product.name}
          </CardTitle>
          <Badge
            variant="secondary"
            className="text-[10px] sm:text-xs whitespace-nowrap shrink-0 px-2 py-0.5"
          >
            {product.category}
          </Badge>
        </div>
        {product.subcategory && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            {product.subcategory}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
          {product.description}
        </p>
        <div className="mt-auto space-y-3">
          <div className="space-y-2">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Options
            </p>
            <div className="space-y-1.5 sm:space-y-2">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-start sm:items-center justify-between gap-2 text-xs sm:text-sm bg-secondary/50 rounded-lg px-3 py-2.5 sm:py-2"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block sm:inline">
                      {variant.name}
                    </span>
                    {variant.description && (
                      <span className="text-muted-foreground block sm:inline sm:ml-1 text-[11px] sm:text-sm">
                        ({variant.description})
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-primary whitespace-nowrap">
                    {variant.price} AED
                  </span>
                </div>
              ))}
            </div>
          </div>
          <AddToCartButton product={product} className="pt-2" />
        </div>
      </CardContent>
    </Card>
  );
}
