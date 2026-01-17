import type { Product } from './types';

// Placeholder image generator - replace these with actual product images
const getPlaceholderImages = (productId: string, count: number = 3): string[] => {
  // Using placeholder images with different colors for visual distinction
  // Replace these URLs with actual product images when available
  const colors = ['E8D5B7', 'D4A574', 'C4956A', 'B8860B', 'DEB887'];
  return Array.from({ length: count }, (_, i) =>
    `/images/${productId}-${i + 1}.jpg`
  );
};

export const products: Product[] = [
  // ==================== COOKIES ====================
  {
    id: 'mini-cookies',
    name: 'Mini Cookies',
    description: 'Bite-sized delicious cookies, perfect for sharing. Served with dipping sauces.',
    category: 'Cookies',
    images: getPlaceholderImages('mini-cookies'),
    variants: [
      {
        id: 'mini-cookies-300g',
        name: 'Box of 300g',
        price: 90,
        description: 'Includes 2 sauces',
      },
      {
        id: 'mini-cookies-1kg',
        name: 'Box of 1kg',
        price: 285,
        description: 'Includes 8 sauces',
      },
    ],
  },
  {
    id: 'chocolate-chip-cookies',
    name: 'Chocolate Chip Cookies',
    description: 'Classic chocolate chip cookies, perfectly baked with premium chocolate chips.',
    category: 'Cookies',
    images: getPlaceholderImages('chocolate-chip-cookies'),
    variants: [
      {
        id: 'choc-chip-8',
        name: 'Box of 8',
        price: 100,
      },
      {
        id: 'choc-chip-12',
        name: 'Box of 12',
        price: 135,
      },
    ],
  },
  {
    id: 'brown-butter-espresso-cookies',
    name: 'Brown Butter Espresso Cookies',
    description: 'Rich brown butter cookies infused with espresso for a sophisticated flavor.',
    category: 'Cookies',
    images: getPlaceholderImages('brown-butter-espresso-cookies'),
    variants: [
      {
        id: 'espresso-8',
        name: 'Box of 8',
        price: 110,
      },
      {
        id: 'espresso-12',
        name: 'Box of 12',
        price: 150,
      },
    ],
  },

  // ==================== BROWNIES ====================
  {
    id: 'classic-brownies',
    name: 'Classic Brownies',
    description: 'Rich, fudgy brownies with optional walnut topping. Available with or without toppings.',
    category: 'Brownies',
    subcategory: 'Classics',
    images: getPlaceholderImages('classic-brownies'),
    variants: [
      {
        id: 'classic-25',
        name: 'Box of 25 pcs (Medium Slices)',
        price: 150,
      },
      {
        id: 'classic-16',
        name: 'Box of 16 pcs',
        price: 150,
      },
      {
        id: 'classic-8',
        name: 'Box of 8 pcs',
        price: 90,
      },
    ],
  },
  {
    id: 'mini-brownies',
    name: 'Mini Brownies',
    description: 'Bite-sized brownies, perfect for gatherings. Available with or without toppings.',
    category: 'Brownies',
    images: getPlaceholderImages('mini-brownies'),
    variants: [
      {
        id: 'mini-brownie-64',
        name: 'Box of 64 pcs',
        price: 150,
      },
      {
        id: 'mini-brownie-32',
        name: 'Box of 32 pcs',
        price: 90,
      },
    ],
  },
  {
    id: 'brownie-dips',
    name: 'Brownie Dips',
    description: 'Delicious brownie bites perfect for dipping. Served with dipping sauces.',
    category: 'Brownies',
    images: getPlaceholderImages('brownie-dips'),
    variants: [
      {
        id: 'brownie-dips-120',
        name: 'Box of 120 pcs',
        price: 150,
        description: 'Includes 4 sauces',
      },
      {
        id: 'brownie-dips-60',
        name: 'Box of 60 pcs',
        price: 90,
        description: 'Includes 2 sauces',
      },
    ],
  },

  // ==================== TIRAMISU ====================
  {
    id: 'tiramisu',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.',
    category: 'Tiramisu',
    images: getPlaceholderImages('tiramisu'),
    variants: [
      {
        id: 'tiramisu-xs',
        name: 'XS',
        price: 55,
        description: 'Serves 1-2',
      },
      {
        id: 'tiramisu-s',
        name: 'S',
        price: 110,
        description: 'Serves 4-6',
      },
      {
        id: 'tiramisu-m',
        name: 'M',
        price: 180,
        description: 'Serves 8-10',
      },
      {
        id: 'tiramisu-l',
        name: 'L',
        price: 250,
        description: 'Serves 12-15',
      },
    ],
  },

  // ==================== ROCKY ROAD ====================
  {
    id: 'rocky-road',
    name: 'Rocky Road',
    description: 'Indulgent chocolate rocky road loaded with marshmallows and nuts.',
    category: 'Rocky Road',
    images: getPlaceholderImages('rocky-road'),
    variants: [
      {
        id: 'rocky-400g',
        name: 'Box of 400g',
        price: 120,
      },
      {
        id: 'rocky-1kg',
        name: 'Box of 1kg',
        price: 300,
      },
    ],
  },

  // ==================== GATHERING BOXES ====================
  {
    id: 'large-gathering-box',
    name: 'Large Gathering Box',
    description: 'Perfect for parties and large gatherings. Choose your preferred combination. Includes 4 sauces.',
    category: 'Gathering Boxes',
    images: getPlaceholderImages('large-gathering-box'),
    variants: [
      {
        id: 'large-box-cookies-brownies',
        name: '300g Mini Cookies + 60pc Brownies',
        price: 180,
      },
      {
        id: 'large-box-cookies-rocky',
        name: '300g Mini Cookies + 300g Rocky Road',
        price: 180,
      },
      {
        id: 'large-box-brownies-rocky',
        name: '60pc Brownies + 300g Rocky Road',
        price: 180,
      },
    ],
  },
  {
    id: 'mini-gathering-box',
    name: 'Mini Gathering Box',
    description: 'Great for smaller gatherings. Choose your preferred combination. Includes 2 sauces.',
    category: 'Gathering Boxes',
    images: getPlaceholderImages('mini-gathering-box'),
    variants: [
      {
        id: 'mini-box-cookies-brownies',
        name: '150g Mini Cookies + 30pc Brownies',
        price: 90,
      },
      {
        id: 'mini-box-cookies-rocky',
        name: '150g Mini Cookies + 150g Rocky Road',
        price: 90,
      },
      {
        id: 'mini-box-brownies-rocky',
        name: '30pc Brownies + 150g Rocky Road',
        price: 90,
      },
    ],
  },
];

export const categories = [
  'Cookies',
  'Brownies',
  'Tiramisu',
  'Rocky Road',
  'Gathering Boxes',
] as const;
