import mysql from 'mysql2/promise';

// Database row types
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
  selected_sauces: string | null;
};

export type AdminSessionRow = {
  id: number;
  token: string;
  expires_at: Date;
};

// Parse DATABASE_URL to connection options
function parseDatabaseUrl(url: string) {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }

  return {
    user: match[1],
    password: decodeURIComponent(match[2]),
    host: match[3],
    port: parseInt(match[4], 10),
    database: match[5],
  };
}

// Create connection pool
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const config = parseDatabaseUrl(databaseUrl);

    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }

  return pool;
}

// Helper to execute queries
export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

// Helper for single row queries
export async function queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

// Helper for insert/update/delete
export async function execute(sql: string, params?: unknown[]): Promise<mysql.ResultSetHeader> {
  const pool = getPool();
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

// Transaction helper
export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
