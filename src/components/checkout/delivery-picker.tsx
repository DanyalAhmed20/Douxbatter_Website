'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UAECity, DeliveryType, DeliveryTimeSlot } from '@/lib/types';
import {
  UAE_CITIES,
  EXPRESS_DELIVERY_CITIES,
  DELIVERY_TIME_SLOTS,
  STANDARD_DELIVERY_FEE,
  EXPRESS_DELIVERY_FEE,
} from '@/lib/types';
import { getDeliveryDateOptions, formatCurrency } from '@/lib/order-utils';

type DeliveryPickerProps = {
  city: UAECity | '';
  onCityChange: (city: UAECity) => void;
  deliveryType: DeliveryType;
  onDeliveryTypeChange: (type: DeliveryType) => void;
  deliveryDate: string;
  onDeliveryDateChange: (date: string) => void;
  deliveryTimeSlot: DeliveryTimeSlot | '';
  onDeliveryTimeSlotChange: (slot: DeliveryTimeSlot) => void;
};

export function DeliveryPicker({
  city,
  onCityChange,
  deliveryType,
  onDeliveryTypeChange,
  deliveryDate,
  onDeliveryDateChange,
  deliveryTimeSlot,
  onDeliveryTimeSlotChange,
}: DeliveryPickerProps) {
  const dateOptions = getDeliveryDateOptions();
  const isExpressAvailable = city && EXPRESS_DELIVERY_CITIES.includes(city as UAECity);

  // Reset to standard if express not available
  if (deliveryType === 'express' && !isExpressAvailable) {
    onDeliveryTypeChange('standard');
  }

  return (
    <div className="space-y-6">
      {/* City Selection */}
      <div className="space-y-2">
        <Label htmlFor="city">City *</Label>
        <Select value={city} onValueChange={(val) => onCityChange(val as UAECity)}>
          <SelectTrigger id="city">
            <SelectValue placeholder="Select your city" />
          </SelectTrigger>
          <SelectContent>
            {UAE_CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Delivery Type */}
      {city && (
        <div className="space-y-3">
          <Label>Delivery Type *</Label>
          <RadioGroup
            value={deliveryType}
            onValueChange={(val) => onDeliveryTypeChange(val as DeliveryType)}
            className="grid gap-3"
          >
            <div className="flex items-center space-x-3 rounded-lg border p-4">
              <RadioGroupItem value="standard" id="standard" />
              <Label htmlFor="standard" className="flex-1 cursor-pointer">
                <div className="font-medium">Standard Delivery</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(STANDARD_DELIVERY_FEE)} - Delivered within your selected date
                </div>
              </Label>
            </div>

            <div
              className={`flex items-center space-x-3 rounded-lg border p-4 ${
                !isExpressAvailable ? 'opacity-50' : ''
              }`}
            >
              <RadioGroupItem
                value="express"
                id="express"
                disabled={!isExpressAvailable}
              />
              <Label
                htmlFor="express"
                className={`flex-1 ${isExpressAvailable ? 'cursor-pointer' : ''}`}
              >
                <div className="font-medium">Express Delivery</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(EXPRESS_DELIVERY_FEE)} - Choose your time slot
                  {!isExpressAvailable && (
                    <span className="block text-xs mt-1">
                      (Only available in Dubai, Sharjah, Ajman, Umm Al Quwain)
                    </span>
                  )}
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Delivery Date */}
      {city && (
        <div className="space-y-2">
          <Label htmlFor="date">Delivery Date *</Label>
          <Select value={deliveryDate} onValueChange={onDeliveryDateChange}>
            <SelectTrigger id="date">
              <SelectValue placeholder="Select delivery date" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                  {option.disabled && ' (Cutoff passed)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Time Slot (Express only) */}
      {deliveryType === 'express' && (
        <div className="space-y-2">
          <Label htmlFor="timeslot">Time Slot *</Label>
          <Select
            value={deliveryTimeSlot}
            onValueChange={(val) => onDeliveryTimeSlotChange(val as DeliveryTimeSlot)}
          >
            <SelectTrigger id="timeslot">
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_TIME_SLOTS.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
