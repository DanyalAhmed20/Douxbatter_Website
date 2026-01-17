'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

type Variant = {
  id: string;
  name: string;
  price: number;
  description: string;
};

interface VariantEditorProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  productId: string;
}

function generateVariantId(productId: string, index: number): string {
  return `${productId}-variant-${index}-${Date.now()}`;
}

export function VariantEditor({ variants, onChange, productId }: VariantEditorProps) {
  const handleAdd = () => {
    const newVariant: Variant = {
      id: generateVariantId(productId, variants.length),
      name: '',
      price: 0,
      description: '',
    };
    onChange([...variants, newVariant]);
  };

  const handleRemove = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onChange(newVariants);
  };

  const handleChange = (
    index: number,
    field: keyof Variant,
    value: string | number
  ) => {
    const newVariants = variants.map((variant, i) => {
      if (i === index) {
        return { ...variant, [field]: value };
      }
      return variant;
    });
    onChange(newVariants);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Variants</Label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No variants added. Click &quot;Add Variant&quot; to create one.
        </p>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="border rounded-lg p-4 space-y-3 bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700">
                  Variant {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 -mt-1 -mr-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`variant-${index}-name`} className="text-xs">
                    Name
                  </Label>
                  <Input
                    id={`variant-${index}-name`}
                    value={variant.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    placeholder="e.g., Box of 8"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`variant-${index}-price`} className="text-xs">
                    Price (AED)
                  </Label>
                  <Input
                    id={`variant-${index}-price`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) =>
                      handleChange(index, 'price', parseFloat(e.target.value) || 0)
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`variant-${index}-description`} className="text-xs">
                  Description (optional)
                </Label>
                <Input
                  id={`variant-${index}-description`}
                  value={variant.description}
                  onChange={(e) =>
                    handleChange(index, 'description', e.target.value)
                  }
                  placeholder="e.g., Includes 2 sauces"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
