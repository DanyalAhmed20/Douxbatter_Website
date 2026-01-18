import type {Metadata} from 'next';
import './globals.css';
import { CartProvider } from '@/components/cart/cart-provider';
import { CartSheet } from '@/components/cart/cart-sheet';

export const metadata: Metadata = {
  title: 'DouxBatter',
  description: 'Handcrafted desserts made with love',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <CartProvider>
          {children}
          <CartSheet />
        </CartProvider>
      </body>
    </html>
  );
}
