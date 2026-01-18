export type ProductCategory =
  | 'Cookies'
  | 'Brownies'
  | 'Tiramisu'
  | 'Rocky Road'
  | 'Gathering Boxes'
  | 'Custom Orders';

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

// Order-related types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type DeliveryTimeSlot = '9AM-12PM' | '12PM-3PM' | '3PM-6PM' | '6PM-9PM';

export type DeliveryType = 'standard' | 'express';

export type UAECity = 'Dubai' | 'Abu Dhabi' | 'Sharjah' | 'Ajman' | 'Umm Al Quwain' | 'Ras Al Khaimah' | 'Fujairah';

export const UAE_CITIES: UAECity[] = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];

export const EXPRESS_DELIVERY_CITIES: UAECity[] = ['Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain'];

export const DELIVERY_TIME_SLOTS: DeliveryTimeSlot[] = ['9AM-12PM', '12PM-3PM', '3PM-6PM', '6PM-9PM'];

// Delivery fees in AED
export const STANDARD_DELIVERY_FEE = 35;
export const EXPRESS_DELIVERY_FEE = 60;

export type OrderItem = {
  id?: number;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
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
  deliveryTimeSlot: DeliveryTimeSlot;
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
