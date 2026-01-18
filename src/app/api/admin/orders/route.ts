import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool, { OrderRow, AdminSessionRow } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

// Verify admin session
async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) {
    return false;
  }

  const [sessions] = await pool.execute<(AdminSessionRow & RowDataPacket)[]>(
    'SELECT * FROM admin_sessions WHERE token = ? AND expires_at > NOW()',
    [token]
  );

  return sessions.length > 0;
}

export async function GET(request: Request) {
  try {
    if (!(await verifySession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query with filters
    let whereClause = '1=1';
    const params: (string | number)[] = [];

    if (status) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    if (paymentStatus) {
      whereClause += ' AND o.payment_status = ?';
      params.push(paymentStatus);
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM orders o WHERE ${whereClause}`,
      params
    );
    const total = (countResult[0] as { total: number }).total;

    // Get orders with pagination
    const [orders] = await pool.execute<(OrderRow & RowDataPacket)[]>(
      `SELECT * FROM orders o
       WHERE ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get item counts for each order
    const ordersWithCounts = await Promise.all(
      orders.map(async (order) => {
        const [itemCount] = await pool.execute<RowDataPacket[]>(
          'SELECT COUNT(*) as count, SUM(quantity) as total_items FROM order_items WHERE order_id = ?',
          [order.id]
        );
        return {
          ...order,
          item_count: (itemCount[0] as { count: number; total_items: number }).total_items || 0,
        };
      })
    );

    return NextResponse.json({
      orders: ordersWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
