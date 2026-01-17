'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  productName: string;
}

export function ImageCarousel({ images, productName }: ImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    onSelect(); // Set initial state

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  return (
    <div className="relative">
      <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-[4/3] bg-muted rounded-t-lg overflow-hidden">
                {/* Placeholder with product initial and slide number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-200/80 flex items-center justify-center mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-amber-800">
                      {productName.charAt(0)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-700 font-medium">
                    Image {index + 1}
                  </p>
                  <p className="text-[10px] sm:text-xs text-amber-600 mt-1">
                    {image.split('/').pop()}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                current === index
                  ? 'bg-amber-600 w-4'
                  : 'bg-amber-300 hover:bg-amber-400'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
