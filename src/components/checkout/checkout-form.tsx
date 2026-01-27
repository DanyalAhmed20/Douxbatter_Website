'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/components/cart';
import { DeliveryPicker } from './delivery-picker';
import type { UAECity, DeliveryType, DeliveryTimeSlot } from '@/lib/types';
import { STANDARD_DELIVERY_FEE, EXPRESS_DELIVERY_FEE } from '@/lib/types';
import { formatCurrency } from '@/lib/order-utils';

export function CheckoutForm() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCart();

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

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const deliveryFee = deliveryType === 'express' ? EXPRESS_DELIVERY_FEE : STANDARD_DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const isFormValid =
    customerName.trim() &&
    customerPhone.trim() &&
    city &&
    deliveryAddress.trim() &&
    deliveryDate &&
    (deliveryType === 'standard' || deliveryTimeSlot) &&
    items.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        city,
        deliveryAddress: deliveryAddress.trim(),
        deliveryType,
        deliveryDate,
        deliveryTimeSlot: deliveryType === 'express' ? deliveryTimeSlot : '',
        items: items.map((item) => {
          const variant = item.product.variants.find((v) => v.id === item.variantId);
          return {
            productId: item.product.id,
            productName: item.product.name,
            variantId: item.variantId,
            variantName: variant?.name || '',
            quantity: item.quantity,
            unitPrice: variant?.price || 0,
            selectedSauces: item.selectedSauces,
          };
        }),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Store reference for potential recovery
      sessionStorage.setItem('pendingOrderRef', data.referenceNumber);

      // Redirect to Ziina payment
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Button onClick={() => router.push('/')}>Browse Menu</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+971 50 123 4567"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
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
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DeliveryPicker
            city={city}
            onCityChange={setCity}
            deliveryType={deliveryType}
            onDeliveryTypeChange={setDeliveryType}
            deliveryDate={deliveryDate}
            onDeliveryDateChange={setDeliveryDate}
            deliveryTimeSlot={deliveryTimeSlot}
            onDeliveryTimeSlotChange={setDeliveryTimeSlot}
          />

          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Building name, street, area..."
              rows={3}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => {
              const variant = item.product.variants.find((v) => v.id === item.variantId);
              const itemTotal = (variant?.price || 0) * item.quantity;

              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.product.name}</span>
                    <span className="text-muted-foreground">
                      {' '}({variant?.name}) x{item.quantity}
                    </span>
                    {item.selectedSauces && item.selectedSauces.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Sauces: {item.selectedSauces.join(', ')}
                      </div>
                    )}
                  </div>
                  <span>{formatCurrency(itemTotal)}</span>
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Delivery ({deliveryType === 'express' ? 'Express' : 'Standard'})
              </span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg touch-manipulation sticky bottom-4 shadow-lg"
        disabled={!isFormValid || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${formatCurrency(total)}`
        )}
      </Button>
    </form>
  );
}
