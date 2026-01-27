import { CheckoutForm } from '@/components/checkout';

export const metadata = {
  title: 'Checkout - DouxBatter',
};

export default function CheckoutPage() {
  return (
    <div className="container max-w-2xl py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
