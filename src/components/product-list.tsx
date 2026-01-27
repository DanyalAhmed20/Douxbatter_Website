'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ProductCard } from './product-card';
import type { Product, ProductCategory } from '@/lib/types';
import { categories } from '@/lib/constants';
import { cn } from '@/lib/utils';

type ProductListProps = {
  products: Product[];
};

export function ProductList({ products }: ProductListProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Get categories that have products
  const availableCategories = categories.filter((cat) =>
    products.some((p) => p.category === cat)
  );

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <ScrollArea className="w-full whitespace-nowrap -mx-4 px-4">
        <div className="flex gap-2 pb-3">
          <Button
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('All')}
            className="h-10 px-4 rounded-full touch-manipulation"
          >
            All
          </Button>
          {availableCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="h-10 px-4 rounded-full touch-manipulation"
            >
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
