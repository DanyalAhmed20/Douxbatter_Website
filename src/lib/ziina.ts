import type { Order } from './types';

const ZIINA_API = 'https://api-v2.ziina.com/api/payment_intent';

type PaymentIntentResponse = {
  id: string;
  redirect_url: string;
  status: string;
  amount: number;
  currency_code: string;
};

/**
 * Create a payment intent with Ziina
 */
export async function createPaymentIntent(order: Order): Promise<PaymentIntentResponse> {
  const accessToken = process.env.ZIINA_ACCESS_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (!accessToken) {
    throw new Error('ZIINA_ACCESS_TOKEN is not configured');
  }

  const response = await fetch(ZIINA_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(order.total * 100), // Convert to fils (50.00 AED = 5000)
      currency_code: 'AED',
      message: `DouxBatter Order #${order.referenceNumber}`,
      success_url: `${baseUrl}/payment-success?ref=${order.referenceNumber}`,
      cancel_url: `${baseUrl}/payment-cancelled?ref=${order.referenceNumber}`,
      test: process.env.NODE_ENV !== 'production',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Ziina API error:', errorData);
    throw new Error(`Ziina API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Verify Ziina webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const webhookSecret = process.env.ZIINA_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('ZIINA_WEBHOOK_SECRET is not configured');
    return true; // Allow in development
  }

  // Ziina uses HMAC-SHA256 for webhook signatures
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}
