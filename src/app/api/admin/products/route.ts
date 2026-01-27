import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import type { ProductRow, ProductVariantRow, ProductImageRow } from '@/lib/db';
import type { Product, ProductCategory } from '@/lib/types';
import type { PoolConnection } from 'mysql2/promise';

export async function GET() {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productRows = await query<ProductRow>(
      'SELECT * FROM products ORDER BY category, name'
    );

    if (productRows.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const productIds = productRows.map((p) => p.id);

    const [variantRows, imageRows] = await Promise.all([
      query<ProductVariantRow>(
        `SELECT * FROM product_variants WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
        productIds
      ),
      query<ProductImageRow>(
        `SELECT * FROM product_images WHERE product_id IN (${productIds.map(() => '?').join(',')}) ORDER BY display_order`,
        productIds
      ),
    ]);

    const products: (Product & { isActive: boolean })[] = productRows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category as ProductCategory,
      subcategory: row.subcategory || undefined,
      isActive: row.is_active,
      variants: variantRows
        .filter((v) => v.product_id === row.id)
        .map((v) => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          description: v.description || undefined,
        })),
      images: imageRows
        .filter((i) => i.product_id === row.id)
        .map((i) => i.image_url),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

type CreateProductRequest = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  subcategory?: string;
  isActive?: boolean;
  variants: {
    id: string;
    name: string;
    price: number;
    description?: string;
  }[];
  images: string[];
};

export async function POST(request: Request) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateProductRequest = await request.json();

    if (!body.id || !body.name || !body.description || !body.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await withTransaction(async (connection: PoolConnection) => {
      // Insert product
      await connection.execute(
        `INSERT INTO products (id, name, description, category, subcategory, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          body.id,
          body.name,
          body.description,
          body.category,
          body.subcategory || null,
          body.isActive !== false,
        ]
      );

      // Insert variants
      for (const variant of body.variants || []) {
        await connection.execute(
          `INSERT INTO product_variants (id, product_id, name, price, description)
           VALUES (?, ?, ?, ?, ?)`,
          [variant.id, body.id, variant.name, variant.price, variant.description || null]
        );
      }

      // Insert images
      for (let i = 0; i < (body.images || []).length; i++) {
        await connection.execute(
          `INSERT INTO product_images (product_id, image_url, display_order)
           VALUES (?, ?, ?)`,
          [body.id, body.images[i], i]
        );
      }
    });

    return NextResponse.json({ success: true, id: body.id });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
