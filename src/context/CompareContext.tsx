'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category?: { name: string };
  brand?: { name: string };
  avgRating?: number;
  highlights?: string[];
  slug?: string;
}

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: number) => void;
  clearCompare: () => void;
  isInCompare: (productId: number) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('compare_items');
    if (saved) setCompareItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('compare_items', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product: Product) => {
    if (compareItems.length >= 4) {
      alert('You can compare up to 4 products at a time.');
      return;
    }
    if (!compareItems.find(i => i.id === product.id)) {
      setCompareItems(prev => [...prev, product]);
    }
  };

  const removeFromCompare = (productId: number) => {
    setCompareItems(prev => prev.filter(i => i.id !== productId));
  };

  const clearCompare = () => setCompareItems([]);

  const isInCompare = (productId: number) => compareItems.some(i => i.id === productId);

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    if (typeof window === 'undefined') {
      return {
        compareItems: [],
        addToCompare: () => {},
        removeFromCompare: () => {},
        clearCompare: () => {},
        isInCompare: () => false
      };
    }
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
