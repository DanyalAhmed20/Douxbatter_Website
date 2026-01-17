import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import pool from '@/lib/db';
import type { ProductRow, ProductVariantRow, ProductImageRow } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

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

    const [products] = await pool.execute<(ProductRow & RowDataPacket)[]>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = products[0];

    const [variants] = await pool.execute<(ProductVariantRow & RowDataPacket)[]>(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY name',
      [id]
    );

    const [images] = await pool.execute<(ProductImageRow & RowDataPacket)[]>(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order',
      [id]
    );

    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      isActive: product.is_active,
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name,
        price: Number(v.price),
        description: v.description,
      })),
      images: images.map((img) => img.image_url),
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { name, description, category, subcategory, isActive, variants, images } =
      await request.json();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update product
      await connection.execute(
        'UPDATE products SET name = ?, description = ?, category = ?, subcategory = ?, is_active = ? WHERE id = ?',
        [name, description, category, subcategory || null, isActive ?? true, id]
      );

      // Delete existing variants and images
      await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);
      await connection.execute('DELETE FROM product_images WHERE product_id = ?', [id]);

      // Insert new variants
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          await connection.execute(
            'INSERT INTO product_variants (id, product_id, name, price, description) VALUES (?, ?, ?, ?, ?)',
            [variant.id, id, variant.name, variant.price, variant.description || null]
          );
        }
      }

      // Insert new images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await connection.execute(
            'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
            [id, images[i], i]
          );
        }
      }

      await connection.commit();

      return NextResponse.json({ success: true });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // CASCADE will handle variants and images deletion
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
