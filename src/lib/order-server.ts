import { format } from 'date-fns';
import { query } from './db';
import type { OrderRow, OrderItemRow } from './db';
import type { Order, OrderItem, SauceOption } from './types';

// Get order by reference number
export async function getOrderByReference(reference: string): Promise<Order | null> {
  try {
    const orders = await query<OrderRow>(
      'SELECT * FROM orders WHERE reference_number = $1',
      [reference]
    );

    if (orders.length === 0) {
      return null;
    }

    const orderRow = orders[0];

    const itemRows = await query<OrderItemRow>(
      'SELECT * FROM order_items WHERE order_id = $1',
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

    return {
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
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// Generate order reference number in format: DB-YYYYMMDD-XXXX
export async function generateReferenceNumber(): Promise<string> {
  const today = new Date();
  const datePrefix = format(today, 'yyyyMMdd');
  const prefix = `DB-${datePrefix}-`;

  // Get the count of orders for today to generate sequential number
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM orders WHERE reference_number LIKE $1`,
    [`${prefix}%`]
  );

  const count = parseInt(result[0]?.count || '0', 10);
  const sequentialNumber = String(count + 1).padStart(4, '0');

  return `${prefix}${sequentialNumber}`;
}
