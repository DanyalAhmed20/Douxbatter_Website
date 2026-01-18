import type { Order } from './types';

const ZIINA_API = 'https://api-v2.ziina.com/api/payment_intent';

type PaymentIntentResponse = {
  id: string;
  redirect_url: string;
  status: string;
  amount: number;
  currency_code: string;
};

export class ZiinaError extends Error {
  public statusCode: number;
  public apiError: unknown;

  constructor(message: string, statusCode: number, apiError?: unknown) {
    super(message);
    this.name = 'ZiinaError';
    this.statusCode = statusCode;
    this.apiError = apiError;
  }
}

/**
 * Create a payment intent with Ziina
 */
export async function createPaymentIntent(order: Order): Promise<PaymentIntentResponse> {
  const accessToken = process.env.ZIINA_ACCESS_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Validate required environment variables
  if (!accessToken) {
    console.error('[Ziina] Missing ZIINA_ACCESS_TOKEN environment variable');
    throw new ZiinaError(
      'Payment service not configured: Missing ZIINA_ACCESS_TOKEN',
      500
    );
  }

  if (!baseUrl) {
    console.error('[Ziina] Missing NEXT_PUBLIC_BASE_URL environment variable');
    throw new ZiinaError(
      'Payment service not configured: Missing NEXT_PUBLIC_BASE_URL',
      500
    );
  }

  const requestBody = {
    amount: Math.round(order.total * 100), // Convert to fils (50.00 AED = 5000)
    currency_code: 'AED',
    message: `DouxBatter Order #${order.referenceNumber}`,
    success_url: `${baseUrl}/payment-success?ref=${order.referenceNumber}`,
    failure_url: `${baseUrl}/payment-failed?ref=${order.referenceNumber}`,
    cancel_url: `${baseUrl}/payment-cancelled?ref=${order.referenceNumber}`,
    test: process.env.NODE_ENV !== 'production',
  };

  console.log('[Ziina] Creating payment intent for order:', order.referenceNumber);

  const response = await fetch(ZIINA_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorData: unknown = null;
    let errorMessage = `Ziina API error: ${response.status} ${response.statusText}`;

    try {
      errorData = await response.json();
      // Extract error message if available
      if (typeof errorData === 'object' && errorData !== null) {
        const err = errorData as Record<string, unknown>;
        if (err.message) {
          errorMessage = `Ziina API error: ${err.message}`;
        } else if (err.error) {
          errorMessage = `Ziina API error: ${err.error}`;
        }
      }
    } catch {
      // Response body is not JSON, use status text
    }

    console.error('[Ziina] Payment intent creation failed:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      orderRef: order.referenceNumber,
    });

    throw new ZiinaError(errorMessage, response.status, errorData);
  }

  const data = await response.json();
  console.log('[Ziina] Payment intent created successfully:', {
    paymentId: data.id,
    orderRef: order.referenceNumber,
  });

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
