'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ImageEditorProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

export function ImageEditor({ images, onChange }: ImageEditorProps) {
  const addImage = () => {
    onChange([...images, '']);
  };

  const updateImage = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    onChange(updated);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updated = [...images];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Images</Label>
        <Button type="button" variant="outline" size="sm" onClick={addImage}>
          <Plus className="h-4 w-4 mr-1" />
          Add Image
        </Button>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No images yet. Add at least one image URL.
        </p>
      ) : (
        <div className="space-y-2">
          {images.map((url, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex flex-col gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => moveImage(index, 'up')}
                  disabled={index === 0}
                >
                  <GripVertical className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
              <Input
                value={url}
                onChange={(e) => updateImage(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeImage(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        The first image will be used as the main product image.
      </p>
    </div>
  );
}
