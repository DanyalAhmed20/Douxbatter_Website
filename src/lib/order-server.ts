import { format } from 'date-fns';
import { query } from './db';

// Generate order reference number in format: DB-YYYYMMDD-XXXX
export async function generateReferenceNumber(): Promise<string> {
  const today = new Date();
  const datePrefix = format(today, 'yyyyMMdd');
  const prefix = `DB-${datePrefix}-`;

  // Get the count of orders for today to generate sequential number
  const result = await query<{ count: number }>(
    `SELECT COUNT(*) as count FROM orders WHERE reference_number LIKE ?`,
    [`${prefix}%`]
  );

  const count = result[0]?.count || 0;
  const sequentialNumber = String(count + 1).padStart(4, '0');

  return `${prefix}${sequentialNumber}`;
}
