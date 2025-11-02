import Link from 'next/link';
import { DouxbatterLogo } from '@/components/icons';
import { CartSheet } from '@/components/cart-sheet';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <DouxbatterLogo className="h-6 w-6 text-primary" />
            <span className="font-headline text-2xl font-bold">Douxbatter</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <CartSheet />
          </nav>
        </div>
      </div>
    </header>
  );
}
