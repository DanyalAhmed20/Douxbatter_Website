'use client';

import Link from 'next/link';
import { ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from './cart-provider';
import { CartItem } from './cart-item';

export function CartSheet() {
  const { items, isOpen, setIsOpen, getSubtotal, getItemCount, clearCart } = useCart();
  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Your Cart ({itemCount})
            </SheetTitle>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add some delicious treats to get started!
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="py-2">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 mt-auto space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{subtotal.toFixed(2)} AED</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Delivery fees calculated at checkout
              </p>

              <div className="space-y-2">
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    Checkout
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={clearCart}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
