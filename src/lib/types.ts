export type ProductCategory =
  | 'Cookies' | 'Brownies' | 'Tiramisu' | 'Rocky Road' | 'Gathering Boxes' | 'Custom Orders';

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  description?: string;  // e.g., "Includes 2 sauces", "Serves 4-6"
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

export const SAUCE_OPTIONS = [
  'Lotus Biscoff', 'Nutella', 'Pistachio',
  'Kinder Bueno', 'Milk Chocolate', 'White Chocolate'
] as const;
export type SauceOption = (typeof SAUCE_OPTIONS)[number];

export type CartItem = {
  id: string;
  product: Product;
  variantId: string;
  quantity: number;
  selectedSauces?: SauceOption[];
};

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type DeliveryType = 'standard' | 'express';
export type DeliveryTimeSlot = '9AM-12PM' | '12PM-3PM' | '3PM-6PM' | '6PM-9PM';
export type UAECity = 'Dubai' | 'Abu Dhabi' | 'Sharjah' | 'Ajman' | 'Umm Al Quwain' | 'Ras Al Khaimah' | 'Fujairah';

export const UAE_CITIES: UAECity[] = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];
export const EXPRESS_DELIVERY_CITIES: UAECity[] = ['Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain'];
export const DELIVERY_TIME_SLOTS: DeliveryTimeSlot[] = ['9AM-12PM', '12PM-3PM', '3PM-6PM', '6PM-9PM'];

export const STANDARD_DELIVERY_FEE = 35;  // AED
export const EXPRESS_DELIVERY_FEE = 60;   // AED

export type OrderItem = {
  id?: number;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedSauces?: SauceOption[];
};

export type Order = {
  id: number;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: UAECity;
  deliveryAddress: string;
  deliveryType: DeliveryType;
  deliveryDate: string;
  deliveryTimeSlot: DeliveryTimeSlot | '';
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  ziinaPaymentId?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
};
