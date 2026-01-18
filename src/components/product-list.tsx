'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ProductCard } from './product-card';
import { categories } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Product, ProductCategory } from '@/lib/types';

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Category Filter - Horizontal scroll on mobile */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide">
          <Button
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('All')}
            className="shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Orders - Contact via WhatsApp */}
      {selectedCategory === 'Custom Orders' ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Custom Cakes / Desserts</h3>
            <h4 className="text-lg font-medium text-muted-foreground">Bulk Orders</h4>
            <p className="text-muted-foreground">
              For custom cakes, desserts, or bulk orders, please contact us directly on WhatsApp. We&apos;d love to create something special for you!
            </p>
            <Button asChild size="lg" className="w-full">
              <a
                href="https://wa.me/971507467480"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact on WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Product count */}
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </p>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
