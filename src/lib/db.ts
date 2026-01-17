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
