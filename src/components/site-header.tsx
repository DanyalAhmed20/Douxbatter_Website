'use client';

import Link from 'next/link';
import { Menu, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CartSheet } from '@/components/cart';
import { getWhatsAppContactUrl } from '@/lib/whatsapp';

export function SiteHeader() {
  const whatsappUrl = getWhatsAppContactUrl();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="text-lg font-medium hover:text-primary">
                Menu
              </Link>
              <Link href="/track-order" className="text-lg font-medium hover:text-primary">
                Track Order
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-medium hover:text-primary flex items-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Contact Us
              </a>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold">DouxBatter</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Menu
          </Link>
          <Link href="/track-order" className="text-sm font-medium hover:text-primary">
            Track Order
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-primary flex items-center gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            Contact
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <CartSheet />
        </div>
      </div>
    </header>
  );
}
