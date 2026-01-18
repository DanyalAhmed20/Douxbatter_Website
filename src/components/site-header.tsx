'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/components/cart/cart-provider';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { getItemCount, setIsOpen: setCartOpen } = useCart();
  const itemCount = getItemCount();

  const navLinks = [
    { href: '/#menu', label: 'Menu' },
    { href: '/track-order', label: 'Track Order' },
    { href: 'https://wa.me/971507467480', label: 'Contact', external: true },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 sm:gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="DouxBatter Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">DouxBatter</h1>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <span className="sr-only">Open cart</span>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <span className="sr-only">Open cart</span>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.jpg"
                    alt="DouxBatter Logo"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <SheetTitle>DouxBatter</SheetTitle>
                </div>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-lg text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
