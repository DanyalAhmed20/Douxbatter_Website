import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool, { OrderRow, OrderItemRow, AdminSessionRow } from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifySession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch order
    const [orders] = await pool.execute<(OrderRow & RowDataPacket)[]>(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orders[0];

    // Fetch order items
    const [items] = await pool.execute<(OrderItemRow & RowDataPacket)[]>(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );

    return NextResponse.json({
      ...order,
      items,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifySession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Build update query dynamically
    const allowedFields = ['status', 'payment_status', 'admin_notes'];
    const updates: string[] = [];
    const values: (string | null)[] = [];

    for (const field of allowedFields) {
      if (field in body) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Fetch updated order
    const [orders] = await pool.execute<(OrderRow & RowDataPacket)[]>(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    return NextResponse.json(orders[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifySession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM orders WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
