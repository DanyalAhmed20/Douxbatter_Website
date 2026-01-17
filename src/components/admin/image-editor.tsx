'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface ImageEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageEditor({ images, onChange }: ImageEditorProps) {
  const handleAdd = () => {
    onChange([...images, '']);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleChange = (index: number, value: string) => {
    const newImages = images.map((img, i) => (i === index ? value : img));
    onChange(newImages);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [
      newImages[index],
      newImages[index - 1],
    ];
    onChange(newImages);
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [
      newImages[index + 1],
      newImages[index],
    ];
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Image URLs</Label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Image
        </Button>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No images added. Click &quot;Add Image&quot; to add one.
        </p>
      ) : (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                >
                  <GripVertical className="h-4 w-4 rotate-90" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === images.length - 1}
                >
                  <GripVertical className="h-4 w-4 -rotate-90" />
                </Button>
              </div>

              <span className="text-sm text-gray-500 w-6">{index + 1}.</span>

              <Input
                value={image}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder="/images/product-image.jpg or https://..."
                className="flex-1"
              />

              {image && (
                <div className="w-12 h-12 border rounded overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
                    }}
                  />
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        You can use local paths (e.g., /images/product.jpg) or full URLs. Drag to
        reorder images.
      </p>
    </div>
  );
}
