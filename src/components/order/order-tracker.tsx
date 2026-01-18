'use client';

import { CheckCircle, Circle, Package, ChefHat, Truck, Home, XCircle } from 'lucide-react';
import type { OrderStatus } from '@/lib/types';

interface OrderTrackerProps {
  status: OrderStatus;
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package, description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Order confirmed and paid' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Your treats are being made' },
  { key: 'ready', label: 'Ready', icon: Truck, description: 'Ready for delivery' },
  { key: 'delivered', label: 'Delivered', icon: Home, description: 'Order has been delivered' },
] as const;

export function OrderTracker({ status }: OrderTrackerProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
        <XCircle className="h-6 w-6 text-red-600" />
        <div>
          <p className="font-medium text-red-800">Order Cancelled</p>
          <p className="text-sm text-red-600">This order has been cancelled</p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex((step) => step.key === status);

  return (
    <div className="space-y-4">
      {STATUS_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-100 text-green-600'
                    : isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              {/* Connector line */}
              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={`w-0.5 h-8 mt-2 ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <p
                className={`font-medium ${
                  isPending ? 'text-gray-400' : 'text-foreground'
                }`}
              >
                {step.label}
              </p>
              <p
                className={`text-sm ${
                  isPending ? 'text-gray-300' : 'text-muted-foreground'
                }`}
              >
                {step.description}
              </p>
              {isCurrent && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary">
                  <Circle className="h-2 w-2 fill-current animate-pulse" />
                  Current Status
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
