import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/ziina';
import { getOrderByPaymentId } from '@/lib/order-server';
import { sendAdminNewOrderNotification } from '@/lib/email';

type ZiinaWebhookPayload = {
  type: string;
  data: {
    id: string;
    amount: number;
    currency_code: string;
    message?: string;
    status: string;
  };
};

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-ziina-signature') || '';
    const payload = await request.text();

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: ZiinaWebhookPayload = JSON.parse(payload);
    const paymentId = event.data.id;

    console.log('Received Ziina webhook:', event.type, paymentId);

    switch (event.type) {
      case 'payment_intent.succeeded':
        // Update order to paid and confirmed
        await execute(
          `UPDATE orders
           SET payment_status = 'paid', status = 'confirmed'
           WHERE ziina_payment_id = $1`,
          [paymentId]
        );
        console.log('Order marked as paid:', paymentId);

        // Send admin notification email
        const order = await getOrderByPaymentId(paymentId);
        if (order) {
          await sendAdminNewOrderNotification(order);
        }
        break;

      case 'payment_intent.failed':
        // Update order to failed payment
        await execute(
          `UPDATE orders
           SET payment_status = 'failed'
           WHERE ziina_payment_id = $1`,
          [paymentId]
        );
        console.log('Order payment failed:', paymentId);
        break;

      default:
        console.log('Unhandled webhook event type:', event.type);
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
