import type { Order } from './types';
import crypto from 'crypto';

const ZIINA_API_URL = 'https://api-v2.ziina.com/api/payment_intent';

export class ZiinaError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ZiinaError';
    this.status = status;
  }
}

type ZiinaPaymentIntentResponse = {
  id: string;
  redirect_url: string;
  status: string;
};

export async function createPaymentIntent(order: Order): Promise<ZiinaPaymentIntentResponse> {
  const accessToken = process.env.ZIINA_ACCESS_TOKEN;

  if (!accessToken) {
    throw new ZiinaError('Ziina access token is not configured', 500);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

  const body = {
    amount: Math.round(order.total * 100), // Convert to fils
    currency_code: 'AED',
    message: `DouxBatter Order #${order.referenceNumber}`,
    success_url: `${baseUrl}/payment-success?ref=${order.referenceNumber}`,
    failure_url: `${baseUrl}/payment-failed?ref=${order.referenceNumber}`,
    cancel_url: `${baseUrl}/payment-cancelled?ref=${order.referenceNumber}`,
    test: process.env.NODE_ENV !== 'production',
  };

  const response = await fetch(ZIINA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ziina API error:', errorText);
    throw new ZiinaError(`Payment gateway error: ${response.status}`, response.status);
  }

  const data = await response.json();
  return data as ZiinaPaymentIntentResponse;
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.ZIINA_WEBHOOK_SECRET;

  if (!secret) {
    console.error('Ziina webhook secret is not configured');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
