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

    // Build query with filters using PostgreSQL numbered parameters
    let sql = 'SELECT * FROM orders WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as count FROM orders WHERE 1=1';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND status = $${paramIndex}`;
      countSql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (paymentStatus) {
      sql += ` AND payment_status = $${paramIndex}`;
      countSql += ` AND payment_status = $${paramIndex}`;
      params.push(paymentStatus);
      paramIndex++;
    }

    // Get total count
    const countResult = await query<{ count: string }>(countSql, params);
    const total = parseInt(countResult[0]?.count || '0', 10);

    // Add ordering and pagination
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const paginatedParams = [...params, limit, offset];

    const orders = await query<OrderRow>(sql, paginatedParams);

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
