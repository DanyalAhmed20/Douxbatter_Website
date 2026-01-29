import { Pool, PoolClient, QueryResultRow } from 'pg';

// Extend global to persist pool across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

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

// Create connection pool (use global in dev to survive hot reloads)
export function getPool(): Pool {
  // In development, use global to persist across hot reloads
  if (process.env.NODE_ENV !== 'production') {
    if (!global.pgPool) {
      global.pgPool = createPool();
    }
    return global.pgPool;
  }

  // In production, use module-level singleton
  if (!productionPool) {
    productionPool = createPool();
  }
  return productionPool;
}

let productionPool: Pool | null = null;

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 5, // Reduced for serverless
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected pool error:', err);
  });

  return pool;
}

// Helper to execute queries
export async function query<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query<T>(sql, params);
  return result.rows;
}

// Helper for single row queries
export async function queryOne<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

// Execute result type for INSERT/UPDATE/DELETE
export type ExecuteResult = {
  rowCount: number | null;
  rows: Record<string, unknown>[];
};

// Helper for insert/update/delete
export async function execute(sql: string, params?: unknown[]): Promise<ExecuteResult> {
  const pool = getPool();
  const result = await pool.query(sql, params);
  return {
    rowCount: result.rowCount,
    rows: result.rows,
  };
}

// Transaction helper
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
