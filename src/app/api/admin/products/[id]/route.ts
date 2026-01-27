import { NextResponse } from 'next/server';
import { query, execute, withTransaction } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import type { ProductRow, ProductVariantRow, ProductImageRow } from '@/lib/db';
import type { Product, ProductCategory } from '@/lib/types';
import type { PoolConnection } from 'mysql2/promise';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const products = await query<ProductRow>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productRow = products[0];

    const [variantRows, imageRows] = await Promise.all([
      query<ProductVariantRow>(
        'SELECT * FROM product_variants WHERE product_id = ?',
        [id]
      ),
      query<ProductImageRow>(
        'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order',
        [id]
      ),
    ]);

    const product: Product & { isActive: boolean } = {
      id: productRow.id,
      name: productRow.name,
      description: productRow.description,
      category: productRow.category as ProductCategory,
      subcategory: productRow.subcategory || undefined,
      isActive: productRow.is_active,
      variants: variantRows.map((v) => ({
        id: v.id,
        name: v.name,
        price: Number(v.price),
        description: v.description || undefined,
      })),
      images: imageRows.map((i) => i.image_url),
    };

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

type UpdateProductRequest = {
  name?: string;
  description?: string;
  category?: ProductCategory;
  subcategory?: string | null;
  isActive?: boolean;
  variants?: {
    id: string;
    name: string;
    price: number;
    description?: string;
  }[];
  images?: string[];
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateProductRequest = await request.json();

    await withTransaction(async (connection: PoolConnection) => {
      // Update product fields
      const updates: string[] = [];
      const updateParams: (string | boolean | null)[] = [];

      if (body.name !== undefined) {
        updates.push('name = ?');
        updateParams.push(body.name);
      }
      if (body.description !== undefined) {
        updates.push('description = ?');
        updateParams.push(body.description);
      }
      if (body.category !== undefined) {
        updates.push('category = ?');
        updateParams.push(body.category);
      }
      if (body.subcategory !== undefined) {
        updates.push('subcategory = ?');
        updateParams.push(body.subcategory);
      }
      if (body.isActive !== undefined) {
        updates.push('is_active = ?');
        updateParams.push(body.isActive);
      }

      if (updates.length > 0) {
        updateParams.push(id);
        await connection.execute(
          `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
          updateParams
        );
      }

      // Update variants if provided
      if (body.variants !== undefined) {
        // Delete existing variants
        await connection.execute(
          'DELETE FROM product_variants WHERE product_id = ?',
          [id]
        );

        // Insert new variants
        for (const variant of body.variants) {
          await connection.execute(
            `INSERT INTO product_variants (id, product_id, name, price, description)
             VALUES (?, ?, ?, ?, ?)`,
            [variant.id, id, variant.name, variant.price, variant.description || null]
          );
        }
      }

      // Update images if provided
      if (body.images !== undefined) {
        // Delete existing images
        await connection.execute(
          'DELETE FROM product_images WHERE product_id = ?',
          [id]
        );

        // Insert new images
        for (let i = 0; i < body.images.length; i++) {
          await connection.execute(
            `INSERT INTO product_images (product_id, image_url, display_order)
             VALUES (?, ?, ?)`,
            [id, body.images[i], i]
          );
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Cascade delete will handle variants and images
    await execute('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
