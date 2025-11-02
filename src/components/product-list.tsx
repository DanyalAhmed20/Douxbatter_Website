'use client';

import { useState, useMemo } from 'react';
import type { Product, ProductCategory, DietaryPreference } from '@/lib/types';
import { ProductCard } from './product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { CakeIcon, BrownieIcon } from './icons';
import { Cookie } from 'lucide-react';
import { Card } from './ui/card';

interface ProductListProps {
  products: Product[];
}

const categories: { name: ProductCategory; icon: React.ElementType }[] = [
  { name: 'Cakes', icon: CakeIcon },
  { name: 'Brownies', icon: BrownieIcon },
  { name: 'Cookies', icon: Cookie },
];

const dietaryOptions: DietaryPreference[] = ['Gluten-Free', 'Vegan', 'Nut-Free'];

export function ProductList({ products }: ProductListProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('Cakes');
  const [dietaryFilters, setDietaryFilters] = useState<DietaryPreference[]>([]);
  const [priceRange, setPriceRange] = useState([0, 50]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = product.category === activeCategory;
      const dietaryMatch =
        dietaryFilters.length === 0 ||
        dietaryFilters.every((filter) => product.dietary.includes(filter));
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];

      return categoryMatch && dietaryMatch && priceMatch;
    });
  }, [products, activeCategory, dietaryFilters, priceRange]);

  const handleDietaryChange = (option: DietaryPreference, checked: boolean) => {
    setDietaryFilters((prev) =>
      checked ? [...prev, option] : prev.filter((item) => item !== option)
    );
  };

  return (
    <section>
      <h2 className="mb-6 text-center font-headline text-4xl font-bold">Our Menu</h2>
      <Tabs
        value={activeCategory}
        onValueChange={(value) => setActiveCategory(value as ProductCategory)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          {categories.map((cat) => (
            <TabsTrigger key={cat.name} value={cat.name} className="gap-2">
              <cat.icon className="h-5 w-5" />
              <span className="hidden sm:inline">{cat.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <Card className="p-4 md:w-1/4 md:self-start">
            <h3 className="mb-4 font-headline text-lg font-semibold">Filter Options</h3>
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block font-semibold">Dietary Preferences</Label>
                <div className="space-y-2">
                  {dietaryOptions.map((option) => (
                    <div key={option} className="flex items-center gap-2">
                      <Checkbox
                        id={option}
                        checked={dietaryFilters.includes(option)}
                        onCheckedChange={(checked) => handleDietaryChange(option, !!checked)}
                      />
                      <Label htmlFor={option} className="font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-4 block font-semibold">Price Range</Label>
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value)}
                />
                <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex-1">
            {categories.map((cat) => (
              <TabsContent key={cat.name} value={cat.name}>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card">
                    <p className="text-lg font-medium text-muted-foreground">No treats found!</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </section>
  );
}
