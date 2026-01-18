import pool from './db';
import type { RowDataPacket } from 'mysql2';

/**
 * Generate a unique order reference number in format: DB-YYYYMMDD-XXXX
 * where XXXX is a sequential number for that day
 */
export async function generateReferenceNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `DB-${dateStr}-`;

  // Get the count of orders created today to generate sequence number
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM orders WHERE reference_number LIKE ?`,
    [`${prefix}%`]
  );

  const count = (rows[0]?.count || 0) as number;
  const sequenceNumber = String(count + 1).padStart(4, '0');

  return `${prefix}${sequenceNumber}`;
}
