'use client';

import { Check, Clock, ChefHat, Package, Truck, XCircle } from 'lucide-react';
import type { OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type OrderTrackerProps = {
  status: OrderStatus;
};

const STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'pending', label: 'Pending', icon: Clock },
  { status: 'confirmed', label: 'Confirmed', icon: Check },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'ready', label: 'Ready', icon: Package },
  { status: 'delivered', label: 'Delivered', icon: Truck },
];

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

export function OrderTracker({ status }: OrderTrackerProps) {
  // Handle cancelled status separately
  if (status === 'cancelled') {
    return (
      <div className="flex flex-col items-center py-8">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-600">Order Cancelled</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This order has been cancelled
        </p>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="w-full py-4">
      {/* Desktop view */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} className="flex flex-col items-center z-10">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all',
                  isActive
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-muted text-muted-foreground',
                  isCurrent && 'ring-4 ring-primary/20'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="sm:hidden space-y-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isActive
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-muted text-muted-foreground',
                    isCurrent && 'ring-4 ring-primary/20'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {/* Connecting line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-1/2 top-10 w-0.5 h-4 -translate-x-1/2',
                      index < currentIndex ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
