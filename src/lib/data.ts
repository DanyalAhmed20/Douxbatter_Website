import type { Product, ProductCategory } from './types';
import { query } from './db';
import type { ProductRow, ProductVariantRow, ProductImageRow } from './db';

// Static product data as fallback when database is unavailable
const staticProducts: Product[] = [
  // Cookies
  {
    id: 'mini-cookies',
    name: 'Mini Cookies',
    description: 'Bite-sized cookies perfect for sharing. Our mini cookies are crispy on the outside and chewy on the inside.',
    category: 'Cookies',
    variants: [
      { id: 'mini-cookies-300g', name: '300g Box', price: 90, description: 'Includes 2 sauces' },
      { id: 'mini-cookies-1kg', name: '1kg Box', price: 285, description: 'Includes 8 sauces' },
    ],
    images: ['https://placehold.co/600x400/f5e6d3/333333?text=Mini+Cookies'],
  },
  {
    id: 'chocolate-chip-cookies',
    name: 'Chocolate Chip Cookies',
    description: 'Classic chocolate chip cookies with premium Belgian chocolate chunks. Perfectly chewy with a golden crisp edge.',
    category: 'Cookies',
    variants: [
      { id: 'choc-chip-8', name: 'Box of 8', price: 100 },
      { id: 'choc-chip-12', name: 'Box of 12', price: 135 },
    ],
    images: ['https://placehold.co/600x400/f5e6d3/333333?text=Chocolate+Chip+Cookies'],
  },
  {
    id: 'brown-butter-espresso-cookies',
    name: 'Brown Butter Espresso Cookies',
    description: 'Rich brown butter cookies infused with premium espresso. A sophisticated treat for coffee lovers.',
    category: 'Cookies',
    variants: [
      { id: 'espresso-8', name: 'Box of 8', price: 110 },
      { id: 'espresso-12', name: 'Box of 12', price: 150 },
    ],
    images: ['https://placehold.co/600x400/f5e6d3/333333?text=Brown+Butter+Espresso'],
  },

  // Brownies
  {
    id: 'classic-brownies',
    name: 'Classic Brownies',
    description: 'Rich, fudgy brownies made with premium dark chocolate. Dense, moist, and intensely chocolatey.',
    category: 'Brownies',
    subcategory: 'Classics',
    variants: [
      { id: 'classic-25', name: '25 Pieces (Medium)', price: 150 },
      { id: 'classic-16', name: '16 Pieces', price: 150 },
      { id: 'classic-8', name: '8 Pieces', price: 90 },
    ],
    images: ['https://placehold.co/600x400/4a3728/ffffff?text=Classic+Brownies'],
  },
  {
    id: 'mini-brownies',
    name: 'Mini Brownies',
    description: 'Bite-sized brownies perfect for gatherings. All the fudgy goodness in a smaller package.',
    category: 'Brownies',
    variants: [
      { id: 'mini-brownie-64', name: '64 Pieces', price: 150 },
      { id: 'mini-brownie-32', name: '32 Pieces', price: 90 },
    ],
    images: ['https://placehold.co/600x400/4a3728/ffffff?text=Mini+Brownies'],
  },
  {
    id: 'brownie-dips',
    name: 'Brownie Dips',
    description: 'Brownie bites paired with our signature dipping sauces. Perfect for sharing at parties.',
    category: 'Brownies',
    variants: [
      { id: 'dips-120', name: '120 Pieces', price: 150, description: 'Includes 4 sauces' },
      { id: 'dips-60', name: '60 Pieces', price: 90, description: 'Includes 2 sauces' },
    ],
    images: ['https://placehold.co/600x400/4a3728/ffffff?text=Brownie+Dips'],
  },

  // Tiramisu
  {
    id: 'tiramisu',
    name: 'Tiramisu',
    description: 'Classic Italian tiramisu made with mascarpone, espresso-soaked ladyfingers, and a dusting of cocoa.',
    category: 'Tiramisu',
    variants: [
      { id: 'tiramisu-xs', name: 'XS', price: 55, description: 'Serves 1-2' },
      { id: 'tiramisu-s', name: 'S', price: 110, description: 'Serves 4-6' },
      { id: 'tiramisu-m', name: 'M', price: 180, description: 'Serves 8-10' },
      { id: 'tiramisu-l', name: 'L', price: 250, description: 'Serves 12-15' },
    ],
    images: ['https://placehold.co/600x400/e8d5b7/333333?text=Tiramisu'],
  },

  // Rocky Road
  {
    id: 'rocky-road',
    name: 'Rocky Road',
    description: 'A delightful mix of marshmallows, nuts, and chocolate pieces in a rich chocolate base.',
    category: 'Rocky Road',
    variants: [
      { id: 'rocky-400g', name: '400g', price: 120 },
      { id: 'rocky-1kg', name: '1kg', price: 300 },
    ],
    images: ['https://placehold.co/600x400/5c3d2e/ffffff?text=Rocky+Road'],
  },

  // Gathering Boxes
  {
    id: 'large-gathering-box',
    name: 'Large Gathering Box',
    description: 'The perfect selection for larger gatherings. A curated mix of our best desserts.',
    category: 'Gathering Boxes',
    variants: [
      { id: 'large-combo-1', name: 'Combo 1: Brownies & Cookies', price: 180, description: 'Includes 4 sauces' },
      { id: 'large-combo-2', name: 'Combo 2: Mixed Brownies', price: 180, description: 'Includes 4 sauces' },
      { id: 'large-combo-3', name: 'Combo 3: Cookie Lovers', price: 180, description: 'Includes 4 sauces' },
    ],
    images: ['https://placehold.co/600x400/d4a574/333333?text=Large+Gathering+Box'],
  },
  {
    id: 'mini-gathering-box',
    name: 'Mini Gathering Box',
    description: 'A smaller selection perfect for intimate gatherings or personal indulgence.',
    category: 'Gathering Boxes',
    variants: [
      { id: 'mini-combo-1', name: 'Combo 1: Brownies & Cookies', price: 90, description: 'Includes 2 sauces' },
      { id: 'mini-combo-2', name: 'Combo 2: Mixed Brownies', price: 90, description: 'Includes 2 sauces' },
      { id: 'mini-combo-3', name: 'Combo 3: Cookie Lovers', price: 90, description: 'Includes 2 sauces' },
    ],
    images: ['https://placehold.co/600x400/d4a574/333333?text=Mini+Gathering+Box'],
  },
];

// Fetch products from database with static fallback
export async function getProducts(): Promise<Product[]> {
  try {
    // Try to fetch from database
    const productRows = await query<ProductRow>(
      'SELECT * FROM products WHERE is_active = TRUE ORDER BY category, name'
    );

    if (productRows.length === 0) {
      // Return static data if database is empty
      return staticProducts;
    }

    const productIds = productRows.map((p) => p.id);

    // Fetch variants and images in parallel
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

    // Map to Product type
    return productRows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category as ProductCategory,
      subcategory: row.subcategory || undefined,
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
  } catch {
    // Return static data if database connection fails
    console.log('Database unavailable, using static product data');
    return staticProducts;
  }
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

// Get products by category
export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.category === category);
}

// Export static products for direct access when needed
export { staticProducts };
