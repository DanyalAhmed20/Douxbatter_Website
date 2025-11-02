'use server';

/**
 * @fileOverview Order summary generation flow for SMS messages.
 *
 * - generateOrderSummary - A function that generates a concise and friendly SMS order summary.
 * - GenerateOrderSummaryInput - The input type for the generateOrderSummary function.
 * - GenerateOrderSummaryOutput - The return type for the generateOrderSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOrderSummaryInputSchema = z.object({
  orderId: z.string().describe('The ID of the order.'),
  customerName: z.string().describe('The name of the customer.'),
  items: z.array(
    z.object({
      name: z.string().describe('The name of the item.'),
      quantity: z.number().describe('The quantity of the item.'),
    })
  ).describe('The items in the order.'),
  totalAmount: z.number().describe('The total amount of the order.'),
  estimatedDelivery: z.string().describe('The estimated delivery date.'),
});
export type GenerateOrderSummaryInput = z.infer<typeof GenerateOrderSummaryInputSchema>;

const GenerateOrderSummaryOutputSchema = z.object({
  smsSummary: z.string().describe('A concise and friendly SMS order summary.'),
});
export type GenerateOrderSummaryOutput = z.infer<typeof GenerateOrderSummaryOutputSchema>;

export async function generateOrderSummary(input: GenerateOrderSummaryInput): Promise<GenerateOrderSummaryOutput> {
  return generateOrderSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOrderSummaryPrompt',
  input: {schema: GenerateOrderSummaryInputSchema},
  output: {schema: GenerateOrderSummaryOutputSchema},
  prompt: `You are an SMS messaging assistant for Douxbatter Delights, a bakery business.  Generate a concise and friendly SMS order summary for the customer.

  Order ID: {{orderId}}
  Customer Name: {{customerName}}
  Items:
  {{#each items}}
  - {{quantity}} x {{name}}
  {{/each}}
  Total Amount: ${{totalAmount}}
  Estimated Delivery: {{estimatedDelivery}}
  `,
});

const generateOrderSummaryFlow = ai.defineFlow(
  {
    name: 'generateOrderSummaryFlow',
    inputSchema: GenerateOrderSummaryInputSchema,
    outputSchema: GenerateOrderSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
