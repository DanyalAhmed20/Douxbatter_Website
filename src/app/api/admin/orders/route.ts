import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import type { OrderRow } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Verify admin session
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Build query with filters
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params: (string | number)[] = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (paymentStatus) {
      sql += ' AND payment_status = ?';
      params.push(paymentStatus);
    }

    // Get total count
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = await query<{ count: number }>(countSql, params);
    const total = countResult[0]?.count || 0;

    // Add ordering and pagination
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const orders = await query<OrderRow>(sql, params);

    // Map to simplified order objects (without items for list view)
    const orderList = orders.map((row) => ({
      id: row.id,
      referenceNumber: row.reference_number,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      city: row.city,
      deliveryDate: row.delivery_date.toISOString().split('T')[0],
      total: Number(row.total),
      status: row.status,
      paymentStatus: row.payment_status,
      createdAt: row.created_at.toISOString(),
    }));

    return NextResponse.json({
      orders: orderList,
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
