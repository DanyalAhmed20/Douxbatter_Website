'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    variants: { id: string; name: string; price: number; description: string }[];
    images: string[];
  }) => {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create product');
    }

    router.push('/admin/dashboard');
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>

      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
