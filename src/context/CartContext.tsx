'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === item.productId && i.variant === item.variant);
      if (existing) {
        return prev.map((i) => 
          i.productId === item.productId && i.variant === item.variant 
          ? { ...i, quantity: i.quantity + item.quantity } 
          : i
        );
      }
      return [...prev, { ...item, id: Date.now() }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, total, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
