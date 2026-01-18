'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCart } from './cart-provider';
import { SAUCE_OPTIONS, type Product, type SauceOption } from '@/lib/types';

// Helper to extract sauce count from variant description
function getSauceCount(description?: string): number {
  if (!description) return 0;
  const match = description.match(/includes?\s+(\d+)\s+sauces?/i);
  return match ? parseInt(match[1], 10) : 0;
}

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [selectedSauces, setSelectedSauces] = useState<SauceOption[]>([]);
  const [isAdded, setIsAdded] = useState(false);

  const selectedVariantData = product.variants.find(
    (v) => v.id === selectedVariant
  );

  const sauceCount = getSauceCount(selectedVariantData?.description);

  // Reset sauces when variant changes
  useEffect(() => {
    setSelectedSauces([]);
  }, [selectedVariant]);

  const handleAddSauce = (sauce: string) => {
    if (selectedSauces.length < sauceCount && !selectedSauces.includes(sauce as SauceOption)) {
      setSelectedSauces([...selectedSauces, sauce as SauceOption]);
    }
  };

  const handleRemoveSauce = (sauce: SauceOption) => {
    setSelectedSauces(selectedSauces.filter((s) => s !== sauce));
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    if (sauceCount > 0 && selectedSauces.length !== sauceCount) return;
    addItem(product, selectedVariant, 1, selectedSauces.length > 0 ? selectedSauces : undefined);
    setIsAdded(true);
    setSelectedSauces([]);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const canAddToCart = selectedVariant && (sauceCount === 0 || selectedSauces.length === sauceCount);

  if (product.variants.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {product.variants.length > 1 ? (
        <div className="space-y-2">
          <Select value={selectedVariant} onValueChange={setSelectedVariant}>
            <SelectTrigger className="w-full text-xs sm:text-sm h-9">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {product.variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  <span className="flex items-center justify-between gap-2 w-full">
                    <span>{variant.name}</span>
                    <span className="text-muted-foreground">
                      {variant.price} AED
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sauce Selection */}
          {sauceCount > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Select {sauceCount} sauce{sauceCount > 1 ? 's' : ''} ({selectedSauces.length}/{sauceCount})
              </p>
              <Select
                value=""
                onValueChange={handleAddSauce}
                disabled={selectedSauces.length >= sauceCount}
              >
                <SelectTrigger className="w-full text-xs sm:text-sm h-9">
                  <SelectValue placeholder="Choose a sauce" />
                </SelectTrigger>
                <SelectContent>
                  {SAUCE_OPTIONS.filter((s) => !selectedSauces.includes(s)).map((sauce) => (
                    <SelectItem key={sauce} value={sauce}>
                      {sauce}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSauces.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedSauces.map((sauce) => (
                    <Badge
                      key={sauce}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveSauce(sauce)}
                    >
                      {sauce}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
            disabled={!canAddToCart || isAdded}
          >
            {isAdded ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart - {selectedVariantData?.price} AED
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Sauce Selection for single variant */}
          {sauceCount > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Select {sauceCount} sauce{sauceCount > 1 ? 's' : ''} ({selectedSauces.length}/{sauceCount})
              </p>
              <Select
                value=""
                onValueChange={handleAddSauce}
                disabled={selectedSauces.length >= sauceCount}
              >
                <SelectTrigger className="w-full text-xs sm:text-sm h-9">
                  <SelectValue placeholder="Choose a sauce" />
                </SelectTrigger>
                <SelectContent>
                  {SAUCE_OPTIONS.filter((s) => !selectedSauces.includes(s)).map((sauce) => (
                    <SelectItem key={sauce} value={sauce}>
                      {sauce}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSauces.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedSauces.map((sauce) => (
                    <Badge
                      key={sauce}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveSauce(sauce)}
                    >
                      {sauce}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
            disabled={!canAddToCart || isAdded}
          >
            {isAdded ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart - {product.variants[0].price} AED
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
