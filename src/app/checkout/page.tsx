'use client';

import { useState } from "react";
import { ShieldCheck, Truck, Tag, CheckCircle } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, getTotal } = useCartStore();
  const [placed, setPlaced] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = getTotal();
  const delivery = subtotal >= 499 ? 0 : 49;
  const total = subtotal - discount + delivery;

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "WELCOME100") setDiscount(100);
    else if (promoCode.toUpperCase() === "HARVEST20") setDiscount(Math.round(subtotal * 0.2));
    else if (promoCode.toUpperCase() === "OILFRIDAY") setDiscount(Math.round(subtotal * 0.15));
    else setDiscount(0);
  };

  if (placed) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Order Placed!</h1>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Thank you for shopping with Namma Orru Foods. Your order has been confirmed and will be delivered within 24 hours.
          </p>
          <p className="mt-2 font-semibold text-[var(--primary)]">Order #ORD-{Math.floor(Math.random() * 9000) + 1000}</p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-xl bg-[var(--secondary)] px-8 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full py-12" style={{ maxWidth: '1400px', paddingLeft: '5%', paddingRight: '5%' }}>
      <h1 className="text-3xl font-bold mb-10">Checkout</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left: Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Delivery Address */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Truck className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-bold">Delivery Address</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {["Full Name", "Phone Number", "Email Address", "Pincode"].map(label => (
                <div key={label}>
                  <label className="block text-sm font-semibold mb-1.5">{label}</label>
                  <input
                    type="text"
                    placeholder={label}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-1.5">Street Address</label>
                <input
                  type="text"
                  placeholder="Flat / House No., Street Name, Area"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="City"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">State</label>
                <input
                  type="text"
                  placeholder="State"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-bold">Payment Method</h2>
            </div>
            <div className="flex flex-col gap-3">
              {["Cash on Delivery", "UPI / QR Code", "Credit / Debit Card", "Net Banking"].map((method, i) => (
                <label key={method} className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 cursor-pointer hover:border-[var(--primary)] transition-colors has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--primary)]/5">
                  <input type="radio" name="payment" defaultChecked={i === 0} className="accent-[var(--primary)]" />
                  <span className="text-sm font-semibold">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-bold mb-5">Order Summary</h2>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                <p>Your cart is empty.</p>
                <Link href="/products" className="mt-3 block text-sm font-semibold text-[var(--primary)] hover:underline">Browse Products</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {cart.map(item => (
                  <div key={`${item.productId}-${item.variant}`} className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--muted)]">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{item.variant} × {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Promo Code */}
            <div className="mt-6 flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[var(--primary)] transition-all"
                />
              </div>
              <button
                onClick={applyPromo}
                className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--primary-dark)] transition-colors"
              >
                Apply
              </button>
            </div>
            {discount > 0 && (
              <p className="mt-2 text-xs font-semibold text-green-600">✓ Promo applied — ₹{discount} saved!</p>
            )}

            {/* Totals */}
            <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Subtotal</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">−₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Delivery</span>
                <span className="font-semibold">{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
              </div>
              {delivery === 0 && <p className="text-xs text-green-600">🎉 Free delivery on orders above ₹499</p>}
              <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold">
                <span>Total</span>
                <span className="text-[var(--primary)]">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => setPlaced(true)}
              disabled={cart.length === 0}
              className="mt-6 w-full rounded-xl bg-[var(--secondary)] py-4 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--secondary)]/20"
            >
              Place Order →
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] justify-center">
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
            <span>Secured by 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
