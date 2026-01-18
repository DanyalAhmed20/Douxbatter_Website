import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateReferenceNumber } from '@/lib/order-server';
import { createPaymentIntent } from '@/lib/ziina';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import type { ResultSetHeader } from 'mysql2';
import type { OrderItem, UAECity, DeliveryType, DeliveryTimeSlot } from '@/lib/types';

type CreateOrderRequest = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  city: UAECity;
  deliveryAddress: string;
  deliveryType: DeliveryType;
  deliveryDate: string;
  deliveryTimeSlot: DeliveryTimeSlot;
  items: OrderItem[];
  subtotal: number;
  total: number;
};

export async function POST(request: Request) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.customerName || !body.customerPhone || !body.city ||
        !body.deliveryAddress || !body.deliveryDate || !body.deliveryTimeSlot ||
        !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate reference number
    const referenceNumber = await generateReferenceNumber();

    // Insert order
    const [orderResult] = await pool.execute<ResultSetHeader>(
      `INSERT INTO orders (
        reference_number, customer_name, customer_phone, customer_email,
        city, delivery_address, delivery_type, delivery_date, delivery_time_slot,
        subtotal, total, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [
        referenceNumber,
        body.customerName,
        body.customerPhone,
        body.customerEmail || null,
        body.city,
        body.deliveryAddress,
        body.deliveryType,
        body.deliveryDate,
        body.deliveryTimeSlot,
        body.subtotal,
        body.total,
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of body.items) {
      await pool.execute(
        `INSERT INTO order_items (
          order_id, product_id, product_name, variant_id, variant_name,
          quantity, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.productName,
          item.variantId,
          item.variantName,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
        ]
      );
    }

    // Create payment intent with Ziina
    const order = {
      id: orderId,
      referenceNumber,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || undefined,
      city: body.city,
      deliveryAddress: body.deliveryAddress,
      deliveryType: body.deliveryType,
      deliveryDate: body.deliveryDate,
      deliveryTimeSlot: body.deliveryTimeSlot,
      items: body.items,
      subtotal: body.subtotal,
      total: body.total,
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    try {
      const paymentIntent = await createPaymentIntent(order);

      if (paymentIntent.redirect_url) {
        // Update order with Ziina payment ID
        await pool.execute(
          'UPDATE orders SET ziina_payment_id = ? WHERE id = ?',
          [paymentIntent.id, orderId]
        );

        // Generate WhatsApp URL for business owner notification
        const whatsAppUrl = generateWhatsAppUrl(order);

        return NextResponse.json({
          success: true,
          referenceNumber,
          orderId,
          redirectUrl: paymentIntent.redirect_url,
          whatsAppUrl,
        });
      }
    } catch (paymentError) {
      console.error('Payment intent creation failed:', paymentError);
      // Continue without payment - order is created but payment pending
    }

    // If payment intent failed or no redirect URL, return order confirmation
    return NextResponse.json({
      success: true,
      referenceNumber,
      orderId,
      whatsAppUrl: generateWhatsAppUrl(order),
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
