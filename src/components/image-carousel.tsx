'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

type ImageCarouselProps = {
  images: string[];
  alt: string;
  aspectRatio?: 'square' | 'video';
};

export function ImageCarousel({ images, alt, aspectRatio = 'square' }: ImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // If no images, show placeholder
  if (images.length === 0) {
    return (
      <div
        className={cn(
          'relative bg-muted rounded-lg overflow-hidden',
          aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          No image
        </div>
      </div>
    );
  }

  // Single image, no carousel needed
  if (images.length === 1) {
    return (
      <div
        className={cn(
          'relative bg-muted rounded-lg overflow-hidden',
          aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'
        )}
      >
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {images.map((src, index) => (
            <div
              key={index}
              className={cn(
                'relative flex-none w-full',
                aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'
              )}
            >
              <Image
                src={src}
                alt={`${alt} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 p-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all touch-manipulation',
              index === selectedIndex
                ? 'bg-white scale-125 shadow-md'
                : 'bg-white/60 hover:bg-white/80'
            )}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
