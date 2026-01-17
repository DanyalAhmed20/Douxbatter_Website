import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import pool from '@/lib/db';
import type { ProductRow, ProductVariantRow, ProductImageRow } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [products] = await pool.execute<(ProductRow & RowDataPacket)[]>(
      'SELECT * FROM products ORDER BY category, name'
    );

    const [variants] = await pool.execute<(ProductVariantRow & RowDataPacket)[]>(
      'SELECT * FROM product_variants ORDER BY product_id, name'
    );

    const [images] = await pool.execute<(ProductImageRow & RowDataPacket)[]>(
      'SELECT * FROM product_images ORDER BY product_id, display_order'
    );

    // Group variants and images by product_id
    const variantsByProduct = variants.reduce((acc, variant) => {
      if (!acc[variant.product_id]) {
        acc[variant.product_id] = [];
      }
      acc[variant.product_id].push(variant);
      return acc;
    }, {} as Record<string, ProductVariantRow[]>);

    const imagesByProduct = images.reduce((acc, image) => {
      if (!acc[image.product_id]) {
        acc[image.product_id] = [];
      }
      acc[image.product_id].push(image.image_url);
      return acc;
    }, {} as Record<string, string[]>);

    const productsWithRelations = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      isActive: product.is_active,
      variants: variantsByProduct[product.id] || [],
      images: imagesByProduct[product.id] || [],
    }));

    return NextResponse.json(productsWithRelations);
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, description, category, subcategory, variants, images } =
      await request.json();

    if (!id || !name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert product
      await connection.execute(
        'INSERT INTO products (id, name, description, category, subcategory) VALUES (?, ?, ?, ?, ?)',
        [id, name, description, category, subcategory || null]
      );

      // Insert variants
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          await connection.execute(
            'INSERT INTO product_variants (id, product_id, name, price, description) VALUES (?, ?, ?, ?, ?)',
            [variant.id, id, variant.name, variant.price, variant.description || null]
          );
        }
      }

      // Insert images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await connection.execute(
            'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
            [id, images[i], i]
          );
        }
      }

      await connection.commit();

      return NextResponse.json({ success: true, id });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
