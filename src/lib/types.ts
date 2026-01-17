export type ProductCategory =
  | 'Cookies'
  | 'Brownies'
  | 'Tiramisu'
  | 'Rocky Road'
  | 'Gathering Boxes';

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  subcategory?: string;
  variants: ProductVariant[];
  images: string[];
};

export type CartItem = {
  id: string;
  product: Product;
  variantId: string;
  quantity: number;
};
