'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryPicker } from './delivery-picker';
import { useCart } from '@/components/cart/cart-provider';
import type { UAECity, DeliveryType, DeliveryTimeSlot, OrderItem } from '@/lib/types';

export function CheckoutForm() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Delivery details
  const [city, setCity] = useState<UAECity | ''>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<DeliveryTimeSlot | ''>('');

  const subtotal = getSubtotal();
  const total = subtotal; // Can add delivery fee logic here if needed

  const isFormValid =
    customerName.trim() &&
    customerPhone.trim() &&
    city &&
    deliveryAddress.trim() &&
    deliveryDate &&
    deliveryTimeSlot &&
    items.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare order items
      const orderItems: OrderItem[] = items.map((item) => {
        const variant = item.product.variants.find((v) => v.id === item.variantId);
        return {
          productId: item.product.id,
          productName: item.product.name,
          variantId: item.variantId,
          variantName: variant?.name || '',
          quantity: item.quantity,
          unitPrice: variant?.price || 0,
          totalPrice: (variant?.price || 0) * item.quantity,
        };
      });

      const orderData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        city,
        deliveryAddress: deliveryAddress.trim(),
        deliveryType,
        deliveryDate,
        deliveryTimeSlot,
        items: orderItems,
        subtotal,
        total,
      };

      // Create the order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // If we have a payment redirect URL, redirect to payment
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      // Otherwise, go directly to confirmation
      clearCart();
      router.push(`/order-confirmation/${data.referenceNumber}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Your cart is empty. Add some items to checkout.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+971 50 XXX XXXX"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DeliveryPicker
            city={city}
            deliveryType={deliveryType}
            deliveryDate={deliveryDate}
            deliveryTimeSlot={deliveryTimeSlot}
            onCityChange={setCity}
            onDeliveryTypeChange={setDeliveryType}
            onDeliveryDateChange={setDeliveryDate}
            onDeliveryTimeSlotChange={setDeliveryTimeSlot}
          />

          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Building name, street, area, landmarks..."
              rows={3}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {items.map((item) => {
              const variant = item.product.variants.find((v) => v.id === item.variantId);
              const itemTotal = (variant?.price || 0) * item.quantity;
              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} ({variant?.name}) x{item.quantity}
                  </span>
                  <span>{itemTotal.toFixed(2)} AED</span>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{subtotal.toFixed(2)} AED</span>
            </div>
            <div className="flex justify-between font-semibold text-lg mt-2">
              <span>Total</span>
              <span>{total.toFixed(2)} AED</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!isFormValid || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay Now - ${total.toFixed(2)} AED`
        )}
      </Button>
    </form>
  );
}
