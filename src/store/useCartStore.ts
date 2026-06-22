import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BundleSubItem {
  productId: number;
  name: string;
  price: number;
  image: string;
}

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  variant: string;
  isBundle?: boolean;
  bundleItems?: BundleSubItem[];
  gstRate?: number | null;
}

interface CartState {
  cart: CartItem[];
  isOpen: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  appliedCoupon: { code: string; discount: number; type: string; message: string } | null;
  setAppliedCoupon: (coupon: { code: string; discount: number; type: string; message: string } | null) => void;
  clearCart: () => void;
  setIsOpen: (open: boolean) => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isOpen: false,
      setIsOpen: (open) => set({ isOpen: open }),
      addToCart: (item) => {
        const { cart } = get();
        const existing = cart.find(
          (i) => i.productId === item.productId && i.variant === item.variant && i.isBundle === item.isBundle
        );

        if (existing) {
          set({
            cart: cart.map((i) =>
              i.productId === item.productId && i.variant === item.variant && i.isBundle === item.isBundle
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({
            cart: [...cart, { ...item, id: Date.now() }],
          });
        }
      },

      appliedCoupon: null,
      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeFromCart: (id) => {
        set({
          cart: get().cart.filter((i) => i.id !== id),
        });
      },
      updateQuantity: (id, quantity) => {
        set({
          cart: get().cart.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },
      clearCart: () => set({ cart: [], appliedCoupon: null }),
      getTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'namma-orru-cart',
    }
  )
);
