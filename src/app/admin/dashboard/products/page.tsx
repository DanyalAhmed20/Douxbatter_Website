'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductTable } from '@/components/admin/product-table';
import { Plus, Package } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string | null;
  isActive: boolean;
  variants: { id: string; name: string; price: number; description: string | null }[];
  images: string[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/products');
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        </div>
        <Link href="/admin/dashboard/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <ProductTable products={products} onDelete={handleDelete} />
      )}
    </div>
  );
}
