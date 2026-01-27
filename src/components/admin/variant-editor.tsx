'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductVariant } from '@/lib/types';

type VariantEditorProps = {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
};

export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const addVariant = () => {
    const newId = `variant-${Date.now()}`;
    onChange([
      ...variants,
      { id: newId, name: '', price: 0, description: '' },
    ]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Variants</Label>
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus className="h-4 w-4 mr-1" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No variants yet. Add at least one variant.
        </p>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="grid gap-4 p-4 border rounded-lg sm:grid-cols-4"
            >
              <div className="space-y-2">
                <Label htmlFor={`variant-id-${index}`}>ID</Label>
                <Input
                  id={`variant-id-${index}`}
                  value={variant.id}
                  onChange={(e) => updateVariant(index, 'id', e.target.value)}
                  placeholder="variant-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`variant-name-${index}`}>Name *</Label>
                <Input
                  id={`variant-name-${index}`}
                  value={variant.name}
                  onChange={(e) => updateVariant(index, 'name', e.target.value)}
                  placeholder="Box of 8"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`variant-price-${index}`}>Price (AED) *</Label>
                <Input
                  id={`variant-price-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`variant-desc-${index}`}>Description</Label>
                <div className="flex gap-2">
                  <Input
                    id={`variant-desc-${index}`}
                    value={variant.description || ''}
                    onChange={(e) => updateVariant(index, 'description', e.target.value)}
                    placeholder="Includes 2 sauces"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(index)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
