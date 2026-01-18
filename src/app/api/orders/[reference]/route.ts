import { NextResponse } from 'next/server';
import pool, { OrderRow, OrderItemRow } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;

    // Fetch order
    const [orders] = await pool.execute<(OrderRow & RowDataPacket)[]>(
      'SELECT * FROM orders WHERE reference_number = ?',
      [reference]
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
      reference_number: order.reference_number,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      city: order.city,
      delivery_address: order.delivery_address,
      delivery_type: order.delivery_type,
      delivery_date: order.delivery_date,
      delivery_time_slot: order.delivery_time_slot,
      subtotal: order.subtotal,
      total: order.total,
      status: order.status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      items: items.map((item) => ({
        id: item.id,
        product_name: item.product_name,
        variant_name: item.variant_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
