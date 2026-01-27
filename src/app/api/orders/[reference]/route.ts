import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { OrderRow, OrderItemRow } from '@/lib/db';
import type { Order, OrderItem, SauceOption } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;

    // Get order
    const orders = await query<OrderRow>(
      'SELECT * FROM orders WHERE reference_number = ?',
      [reference]
    );

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderRow = orders[0];

    // Get order items
    const itemRows = await query<OrderItemRow>(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderRow.id]
    );

    const items: OrderItem[] = itemRows.map((row) => ({
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
      variantId: row.variant_id,
      variantName: row.variant_name,
      quantity: row.quantity,
      unitPrice: Number(row.unit_price),
      totalPrice: Number(row.total_price),
      selectedSauces: row.selected_sauces
        ? (JSON.parse(row.selected_sauces) as SauceOption[])
        : undefined,
    }));

    const order: Order = {
      id: orderRow.id,
      referenceNumber: orderRow.reference_number,
      customerName: orderRow.customer_name,
      customerPhone: orderRow.customer_phone,
      customerEmail: orderRow.customer_email || undefined,
      city: orderRow.city as Order['city'],
      deliveryAddress: orderRow.delivery_address,
      deliveryType: orderRow.delivery_type,
      deliveryDate: orderRow.delivery_date.toISOString().split('T')[0],
      deliveryTimeSlot: orderRow.delivery_time_slot as Order['deliveryTimeSlot'],
      items,
      subtotal: Number(orderRow.subtotal),
      total: Number(orderRow.total),
      status: orderRow.status,
      paymentStatus: orderRow.payment_status,
      ziinaPaymentId: orderRow.ziina_payment_id || undefined,
      adminNotes: orderRow.admin_notes || undefined,
      createdAt: orderRow.created_at.toISOString(),
      updatedAt: orderRow.updated_at?.toISOString(),
    };

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
