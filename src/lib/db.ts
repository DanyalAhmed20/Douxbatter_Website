import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  description: string | null;
};

export type ProductImageRow = {
  id: number;
  product_id: string;
  image_url: string;
  display_order: number;
};

export type AdminSessionRow = {
  id: number;
  token: string;
  expires_at: Date;
};

export type OrderRow = {
  id: number;
  reference_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  city: string;
  delivery_address: string;
  delivery_type: 'standard' | 'express';
  delivery_date: Date;
  delivery_time_slot: string;
  subtotal: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  ziina_payment_id: string | null;
  admin_notes: string | null;
  created_at: Date;
  updated_at: Date;
};

export type OrderItemRow = {
  id: number;
  order_id: number;
  product_id: string;
  product_name: string;
  variant_id: string;
  variant_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};
