'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from './cart-provider';
import type { Product, ProductVariant, SauceOption } from '@/lib/types';
import { SAUCE_OPTIONS } from '@/lib/types';
import { formatCurrency } from '@/lib/order-utils';

type AddToCartButtonProps = {
  product: Product;
};

// Parse number of sauces from variant description
function parseSauceCount(description?: string): number {
  if (!description) return 0;
  const match = description.toLowerCase().match(/(\d+)\s*sauce/);
  return match ? parseInt(match[1], 10) : 0;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length === 1 ? product.variants[0] : null
  );
  const [showSaucePicker, setShowSaucePicker] = useState(false);
  const [selectedSauces, setSelectedSauces] = useState<SauceOption[]>([]);

  const sauceCount = selectedVariant ? parseSauceCount(selectedVariant.description) : 0;

  const handleAddClick = () => {
    if (!selectedVariant) return;

    if (sauceCount > 0) {
      // Show sauce picker dialog
      setSelectedSauces([]);
      setShowSaucePicker(true);
    } else {
      // Add directly without sauces
      addItem(product, selectedVariant.id, 1);
    }
  };

  const handleSauceToggle = (sauce: SauceOption) => {
    setSelectedSauces((prev) => {
      if (prev.includes(sauce)) {
        return prev.filter((s) => s !== sauce);
      }
      if (prev.length >= sauceCount) {
        // Replace the first selected sauce
        return [...prev.slice(1), sauce];
      }
      return [...prev, sauce];
    });
  };

  const handleConfirmSauces = () => {
    if (selectedVariant && selectedSauces.length === sauceCount) {
      addItem(product, selectedVariant.id, 1, selectedSauces);
      setShowSaucePicker(false);
      setSelectedSauces([]);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 mt-4">
        {product.variants.length > 1 && (
          <Select
            value={selectedVariant?.id || ''}
            onValueChange={(value) => {
              const variant = product.variants.find((v) => v.id === value);
              setSelectedVariant(variant || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {product.variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.name} - {formatCurrency(variant.price)}
                  {variant.description && ` (${variant.description})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          onClick={handleAddClick}
          disabled={!selectedVariant}
          className="w-full h-12 text-base touch-manipulation"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
          {selectedVariant && ` - ${formatCurrency(selectedVariant.price)}`}
        </Button>
      </div>

      <Dialog open={showSaucePicker} onOpenChange={setShowSaucePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Select {sauceCount} Sauce{sauceCount > 1 ? 's' : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
            {SAUCE_OPTIONS.map((sauce) => (
              <div
                key={sauce}
                className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors touch-manipulation"
                onClick={() => handleSauceToggle(sauce)}
              >
                <Checkbox
                  id={sauce}
                  checked={selectedSauces.includes(sauce)}
                  className="h-5 w-5 pointer-events-none"
                />
                <Label className="text-sm cursor-pointer flex-1 pointer-events-none">
                  {sauce}
                </Label>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Selected: {selectedSauces.length} / {sauceCount}
          </p>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSaucePicker(false)}
              className="w-full sm:w-auto h-11 touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSauces}
              disabled={selectedSauces.length !== sauceCount}
              className="w-full sm:w-auto h-11 touch-manipulation"
            >
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
