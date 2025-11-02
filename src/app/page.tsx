import Image from 'next/image';
import { products } from '@/lib/data';
import { ProductList } from '@/components/product-list';
import { placeholderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = placeholderImages.find((img) => img.id === 'hero');

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="relative mb-12 h-80 w-full overflow-hidden rounded-lg shadow-lg md:h-96">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <h1 className="font-headline text-5xl font-bold tracking-tight md:text-7xl">
            Douxbatter Delights
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl">
            Handcrafted goodness, baked with love, delivered to your door.
          </p>
        </div>
      </section>

      <ProductList products={products} />
    </div>
  );
}
