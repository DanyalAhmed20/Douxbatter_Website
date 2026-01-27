import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/admin';

export const metadata = {
  title: 'New Product - DouxBatter Admin',
};

export default function NewProductPage() {
  return (
    <div>
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin/dashboard/products">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-6">New Product</h1>

      <ProductForm />
    </div>
  );
}
