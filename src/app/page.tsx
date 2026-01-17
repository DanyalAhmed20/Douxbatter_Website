import { SiteHeader } from '@/components/site-header';
import { ProductList } from '@/components/product-list';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section id="menu" className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-1 sm:mb-2">
              Our Menu
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Handcrafted desserts made with love. All prices in AED.
            </p>
          </div>
          <ProductList />
        </section>
      </main>
      <footer className="border-t py-4 sm:py-6">
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>DouxBatter - Handcrafted Desserts</p>
        </div>
      </footer>
    </div>
  );
}
