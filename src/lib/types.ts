import type { ImagePlaceholder } from './placeholder-images';

export type DietaryPreference = 'Gluten-Free' | 'Vegan' | 'Nut-Free';
export type ProductCategory = 'Cakes' | 'Brownies' | 'Cookies';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageId: ImagePlaceholder['id'];
  category: ProductCategory;
  dietary: DietaryPreference[];
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
};
