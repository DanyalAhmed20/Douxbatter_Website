import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateReferenceNumber } from '@/lib/order-server';
import { createPaymentIntent, ZiinaError } from '@/lib/ziina';
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
  deliveryTimeSlot: DeliveryTimeSlot | '';
  items: OrderItem[];
  subtotal: number;
  total: number;
};

export async function POST(request: Request) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.customerName || !body.customerPhone || !body.city ||
        !body.deliveryAddress || !body.deliveryDate ||
        !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate time slot is required for express delivery
    if (body.deliveryType === 'express' && !body.deliveryTimeSlot) {
      return NextResponse.json(
        { error: 'Time slot is required for express delivery' },
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
          quantity, unit_price, total_price, selected_sauces
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.productName,
          item.variantId,
          item.variantName,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
          item.selectedSauces ? JSON.stringify(item.selectedSauces) : null,
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

    // Create payment intent with Ziina
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

    // If no redirect URL returned (shouldn't happen normally)
    console.error('[Orders] Payment intent created but no redirect URL:', paymentIntent);
    return NextResponse.json(
      { error: 'Payment service returned an incomplete response' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[Orders] Order creation error:', error);

    // Handle Ziina-specific errors
    if (error instanceof ZiinaError) {
      return NextResponse.json(
        {
          error: error.message,
          code: 'PAYMENT_SERVICE_ERROR',
          ...(process.env.NODE_ENV !== 'production' && { details: error.apiError }),
        },
        { status: error.statusCode }
      );
    }

    // Handle database connection errors
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as { code: string; message?: string };
      if (dbError.code === 'ECONNREFUSED' || dbError.code === 'ENOTFOUND') {
        return NextResponse.json(
          { error: 'Database connection failed', code: 'DATABASE_ERROR' },
          { status: 503 }
        );
      }
    }

    // Generic error with message in non-production
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to create order',
        code: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV !== 'production' && { details: errorMessage }),
      },
      { status: 500 }
    );
  }
}
