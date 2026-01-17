import { SiteHeader } from '@/components/site-header';
import { ProductList } from '@/components/product-list';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Our Menu</h2>
            <p className="text-muted-foreground">
              Handcrafted desserts made with love. All prices in AED.
            </p>
          </div>
          <ProductList />
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>DouxBatter - Handcrafted Desserts</p>
        </div>
      </footer>
    </div>
  );
}
