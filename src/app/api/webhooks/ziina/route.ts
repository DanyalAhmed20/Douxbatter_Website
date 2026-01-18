import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/ziina';

type ZiinaWebhookPayload = {
  id: string;
  event: string;
  data: {
    id: string;
    status: string;
    amount: number;
    currency_code: string;
  };
};

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-ziina-signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data: ZiinaWebhookPayload = JSON.parse(payload);
    console.log('Ziina webhook received:', data.event, data.data.id);

    // Handle payment_intent.succeeded event
    if (data.event === 'payment_intent.succeeded') {
      const paymentId = data.data.id;

      // Update order payment status
      await pool.execute(
        `UPDATE orders SET payment_status = 'paid', status = 'confirmed'
         WHERE ziina_payment_id = ?`,
        [paymentId]
      );

      console.log('Order payment confirmed for payment ID:', paymentId);
    }

    // Handle payment_intent.failed event
    if (data.event === 'payment_intent.failed') {
      const paymentId = data.data.id;

      await pool.execute(
        `UPDATE orders SET payment_status = 'failed'
         WHERE ziina_payment_id = ?`,
        [paymentId]
      );

      console.log('Order payment failed for payment ID:', paymentId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
