import { getProducts } from '@/lib/data';
import { ProductList } from '@/components/product-list';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Our Menu</h1>
        <p className="text-muted-foreground">
          Freshly baked desserts delivered to your door across UAE
        </p>
      </div>

      <ProductList products={products} />
    </div>
  );
}
