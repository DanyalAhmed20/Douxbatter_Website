'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { generateSmsAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Clipboard, FileText } from 'lucide-react';

interface OrderSummaryGeneratorProps {
  orderData: {
    orderId: string;
    customerName: string;
    items: { name: string; quantity: number }[];
    totalAmount: number;
    estimatedDelivery: string;
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Bot className="mr-2 h-4 w-4" />
      {pending ? 'Generating...' : 'Generate SMS Summary'}
    </Button>
  );
}

export function OrderSummaryGenerator({ orderData }: OrderSummaryGeneratorProps) {
  const initialState = { summary: '', error: '' };
  const [state, formAction] = useFormState(generateSmsAction, initialState);

  const handleCopy = () => {
    if (state.summary) {
      navigator.clipboard.writeText(state.summary);
      // You could add a toast notification here for feedback
    }
  };

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          <FileText />
          AI Order Summary
        </CardTitle>
        <CardDescription>
          Generate a concise summary of your order, perfect for sending via SMS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction}>
          <input type="hidden" name="orderData" value={JSON.stringify(orderData)} />
          <SubmitButton />
        </form>

        {state.summary && (
          <div className="space-y-2">
            <Textarea readOnly value={state.summary} rows={4} className="bg-background" />
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Clipboard className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
          </div>
        )}

        {state.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}
      </CardContent>
    </Card>
  );
}
