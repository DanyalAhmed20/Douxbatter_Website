'use server';

import { generateOrderSummary } from '@/ai/flows/generate-order-summary';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export async function placeOrderAction(data: unknown) {
  const schema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    // Add more fields as needed for address, etc.
  });

  const validatedFields = schema.safeParse(data);

  if (!validatedFields.success) {
    // In a real app, you'd return error messages
    console.error(validatedFields.error.flatten().fieldErrors);
    return;
  }
  
  // In a real app, you would process payment and save the order to a database.
  const mockOrderId = `douxbatter-${Math.random().toString(36).substring(2, 9)}`;

  redirect(`/order/${mockOrderId}`);
}

type GenerateSummaryState = {
  summary?: string;
  error?: string;
}

export async function generateSmsAction(prevState: GenerateSummaryState, formData: FormData): Promise<GenerateSummaryState> {
  const orderDataString = formData.get('orderData');
  if (typeof orderDataString !== 'string') {
    return { error: 'Invalid order data.' };
  }

  try {
    const orderData = JSON.parse(orderDataString);

    // Basic validation for the parsed data
    const inputSchema = z.object({
      orderId: z.string(),
      customerName: z.string(),
      items: z.array(z.object({ name: z.string(), quantity: z.number() })),
      totalAmount: z.number(),
      estimatedDelivery: z.string(),
    });

    const parsedOrder = inputSchema.parse(orderData);

    const result = await generateOrderSummary(parsedOrder);
    return { summary: result.smsSummary };
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return { error: 'Order data is malformed.' };
    }
    return { error: 'Failed to generate SMS summary. Please try again.' };
  }
}
