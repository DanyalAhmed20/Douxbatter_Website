import { NextResponse } from 'next/server';
import { execute, withTransaction } from '@/lib/db';
import { generateReferenceNumber } from '@/lib/order-server';
import { createPaymentIntent, ZiinaError } from '@/lib/ziina';
import type { Order, OrderItem, UAECity, DeliveryType, DeliveryTimeSlot, SauceOption } from '@/lib/types';
import { STANDARD_DELIVERY_FEE, EXPRESS_DELIVERY_FEE } from '@/lib/types';
import type { PoolConnection } from 'mysql2/promise';

type CreateOrderRequest = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: UAECity;
  deliveryAddress: string;
  deliveryType: DeliveryType;
  deliveryDate: string;
  deliveryTimeSlot: DeliveryTimeSlot | '';
  items: {
    productId: string;
    productName: string;
    variantId: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
    selectedSauces?: SauceOption[];
  }[];
};

export async function POST(request: Request) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.customerName || !body.customerPhone || !body.city || !body.deliveryAddress || !body.deliveryDate || !body.items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = body.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const deliveryFee = body.deliveryType === 'express' ? EXPRESS_DELIVERY_FEE : STANDARD_DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    // Generate reference number
    const referenceNumber = await generateReferenceNumber();

    // Create order in database
    const order = await withTransaction(async (connection: PoolConnection) => {
      // Insert order
      const [orderResult] = await connection.execute(
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
          body.deliveryTimeSlot || '',
          subtotal,
          total,
        ]
      );

      const orderId = (orderResult as { insertId: number }).insertId;

      // Insert order items
      for (const item of body.items) {
        await connection.execute(
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
            item.unitPrice * item.quantity,
            item.selectedSauces ? JSON.stringify(item.selectedSauces) : null,
          ]
        );
      }

      // Build order object for Ziina
      const orderItems: OrderItem[] = body.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
        selectedSauces: item.selectedSauces,
      }));

      return {
        id: orderId,
        referenceNumber,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail,
        city: body.city,
        deliveryAddress: body.deliveryAddress,
        deliveryType: body.deliveryType,
        deliveryDate: body.deliveryDate,
        deliveryTimeSlot: body.deliveryTimeSlot || '',
        items: orderItems,
        subtotal,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
      } as Order;
    });

    // Create Ziina payment intent
    const paymentIntent = await createPaymentIntent(order);

    // Update order with Ziina payment ID
    await execute(
      'UPDATE orders SET ziina_payment_id = ? WHERE reference_number = ?',
      [paymentIntent.id, referenceNumber]
    );

    return NextResponse.json({
      referenceNumber,
      paymentUrl: paymentIntent.redirect_url,
    });
  } catch (error) {
    console.error('Error creating order:', error);

    if (error instanceof ZiinaError) {
      return NextResponse.json(
        { error: 'Payment gateway error. Please try again.' },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
