'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { Product, CartItem } from '@/lib/types';

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, variantId: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'douxbatter-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product: Product, variantId: string, quantity = 1) => {
    setItems((prev) => {
      // Check if item with same product and variant already exists
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variantId === variantId
      );

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      // Add new item
      const newItem: CartItem = {
        id: `${product.id}-${variantId}-${Date.now()}`,
        product,
        variantId,
        quantity,
      };
      return [...prev, newItem];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => {
      const variant = item.product.variants.find((v) => v.id === item.variantId);
      return total + (variant?.price || 0) * item.quantity;
    }, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
