import { NextResponse } from 'next/server';
import { query, execute, withTransaction } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import type { ProductRow, ProductVariantRow, ProductImageRow } from '@/lib/db';
import type { Product, ProductCategory } from '@/lib/types';
import type { PoolClient } from 'pg';

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
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productRow = products[0];

    const [variantRows, imageRows] = await Promise.all([
      query<ProductVariantRow>(
        'SELECT * FROM product_variants WHERE product_id = $1',
        [id]
      ),
      query<ProductImageRow>(
        'SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order',
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

    await withTransaction(async (client: PoolClient) => {
      // Update product fields
      const updates: string[] = [];
      const updateParams: (string | boolean | null)[] = [];
      let paramIndex = 1;

      if (body.name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        updateParams.push(body.name);
        paramIndex++;
      }
      if (body.description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        updateParams.push(body.description);
        paramIndex++;
      }
      if (body.category !== undefined) {
        updates.push(`category = $${paramIndex}`);
        updateParams.push(body.category);
        paramIndex++;
      }
      if (body.subcategory !== undefined) {
        updates.push(`subcategory = $${paramIndex}`);
        updateParams.push(body.subcategory);
        paramIndex++;
      }
      if (body.isActive !== undefined) {
        updates.push(`is_active = $${paramIndex}`);
        updateParams.push(body.isActive);
        paramIndex++;
      }

      if (updates.length > 0) {
        updateParams.push(id);
        await client.query(
          `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
          updateParams
        );
      }

      // Update variants if provided
      if (body.variants !== undefined) {
        // Delete existing variants
        await client.query(
          'DELETE FROM product_variants WHERE product_id = $1',
          [id]
        );

        // Insert new variants
        for (const variant of body.variants) {
          await client.query(
            `INSERT INTO product_variants (id, product_id, name, price, description)
             VALUES ($1, $2, $3, $4, $5)`,
            [variant.id, id, variant.name, variant.price, variant.description || null]
          );
        }
      }

      // Update images if provided
      if (body.images !== undefined) {
        // Delete existing images
        await client.query(
          'DELETE FROM product_images WHERE product_id = $1',
          [id]
        );

        // Insert new images
        for (let i = 0; i < body.images.length; i++) {
          await client.query(
            `INSERT INTO product_images (product_id, image_url, display_order)
             VALUES ($1, $2, $3)`,
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
    await execute('DELETE FROM products WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
