import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '@/lib/api';

interface WishlistState {
  wishlist: number[]; // Array of product IDs
  isLoading: boolean;
  fetchWishlist: (userId: number) => Promise<void>;
  toggleWishlist: (userId: number, productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      isLoading: false,

      fetchWishlist: async (userId) => {
        if (!userId) return;
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_URL}/api/wishlist/${userId}`);
          if (res.ok) {
            const data = await res.json();
            // data will be an array of WishlistItem with product nested
            const ids = (data || []).map((item: any) => item.productId);
            set({ wishlist: ids });
          }
        } catch (error) {
          console.error('Wishlist Fetch Failed:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      toggleWishlist: async (userId, productId) => {
        const { wishlist } = get();
        const isExist = wishlist.includes(productId);
        
        // Pessimistic Update logic for Server-Side reliance
        try {
          if (isExist) {
            // Remove
            const res = await fetch(`${API_URL}/api/wishlist/${userId}/${productId}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              set({ wishlist: wishlist.filter(id => id !== productId) });
              return false; // Now NOT in wishlist
            }
          } else {
            // Add
            const res = await fetch(`${API_URL}/api/wishlist`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, productId })
            });
            if (res.ok) {
              set({ wishlist: [...wishlist, productId] });
              return true; // Now IN wishlist
            }
          }
        } catch (error) {
          console.error('Toggle Wishlist Error:', error);
        }
        return isExist; // Rollback safe state return
      },

      isInWishlist: (productId) => {
        return get().wishlist.includes(productId);
      },

      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: 'namma-orru-wishlist', // Persist local lookup for faster render before hydration
      partialize: (state) => ({ wishlist: state.wishlist }), 
    }
  )
);
