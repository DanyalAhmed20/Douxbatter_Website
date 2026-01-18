'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  UAE_CITIES,
  EXPRESS_DELIVERY_CITIES,
  DELIVERY_TIME_SLOTS,
  type UAECity,
  type DeliveryTimeSlot,
  type DeliveryType,
} from '@/lib/types';
import { getDeliveryDateOptions } from '@/lib/order-utils';

interface DeliveryPickerProps {
  city: UAECity | '';
  deliveryType: DeliveryType;
  deliveryDate: string;
  deliveryTimeSlot: DeliveryTimeSlot | '';
  onCityChange: (city: UAECity) => void;
  onDeliveryTypeChange: (type: DeliveryType) => void;
  onDeliveryDateChange: (date: string) => void;
  onDeliveryTimeSlotChange: (slot: DeliveryTimeSlot) => void;
}

export function DeliveryPicker({
  city,
  deliveryType,
  deliveryDate,
  deliveryTimeSlot,
  onCityChange,
  onDeliveryTypeChange,
  onDeliveryDateChange,
  onDeliveryTimeSlotChange,
}: DeliveryPickerProps) {
  const [dateOptions, setDateOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    setDateOptions(getDeliveryDateOptions());
  }, []);

  const canSelectExpress = city && EXPRESS_DELIVERY_CITIES.includes(city as UAECity);

  // Reset to standard if express not available
  useEffect(() => {
    if (!canSelectExpress && deliveryType === 'express') {
      onDeliveryTypeChange('standard');
    }
  }, [canSelectExpress, deliveryType, onDeliveryTypeChange]);

  return (
    <div className="space-y-6">
      {/* City Selection */}
      <div className="space-y-2">
        <Label htmlFor="city">City *</Label>
        <Select value={city} onValueChange={(v) => onCityChange(v as UAECity)}>
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
            onValueChange={(v) => onDeliveryTypeChange(v as DeliveryType)}
            className="space-y-2"
          >
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
              <RadioGroupItem value="standard" id="standard" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="standard" className="font-medium cursor-pointer">
                  Standard Delivery
                </Label>
                <p className="text-sm text-muted-foreground">
                  Available for all UAE cities
                </p>
              </div>
            </div>
            <div
              className={`flex items-start space-x-3 p-3 border rounded-lg ${
                canSelectExpress
                  ? 'hover:bg-secondary/50 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <RadioGroupItem
                value="express"
                id="express"
                disabled={!canSelectExpress}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="express"
                  className={`font-medium ${canSelectExpress ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  Express Delivery
                </Label>
                <p className="text-sm text-muted-foreground">
                  {canSelectExpress
                    ? 'Same-day or next-day delivery'
                    : 'Only available for Dubai, Sharjah, Ajman, Umm Al Quwain'}
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Delivery Date */}
      {city && (
        <div className="space-y-2">
          <Label htmlFor="delivery-date">Delivery Date *</Label>
          <Select value={deliveryDate} onValueChange={onDeliveryDateChange}>
            <SelectTrigger id="delivery-date">
              <SelectValue placeholder="Select delivery date" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Delivery Time Slot */}
      {city && deliveryDate && (
        <div className="space-y-2">
          <Label htmlFor="time-slot">Preferred Time Slot *</Label>
          <Select
            value={deliveryTimeSlot}
            onValueChange={(v) => onDeliveryTimeSlotChange(v as DeliveryTimeSlot)}
          >
            <SelectTrigger id="time-slot">
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
