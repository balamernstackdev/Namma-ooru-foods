'use client';

import { useState, useEffect } from 'react';
import {
   ShieldCheck, Truck, CheckCircle, RefreshCw, MapPin, Plus, ChevronRight, User, CreditCard, Lock, ChevronDown, ChevronUp, Tag, Home, Briefcase, Download, Package, FileText, Sparkles, Star, ShoppingBag, Phone
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Script from 'next/script';
import { API_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Address { id: number; name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string; isDefault: boolean; type?: string; }

export default function CheckoutPage() {
   const { cart, getTotal, clearCart, appliedCoupon, setAppliedCoupon } = useCartStore();
   const { user } = useAuth();

   const [step, setStep] = useState(2); // 1: Cart, 2: Delivery, 3: Payment, 4: Complete
   const [placed, setPlaced] = useState(false);
   const [isProcessing, setIsProcessing] = useState(false);
   const [mounted, setMounted] = useState(false);
   const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

   // Form States
   const [email, setEmail] = useState('');
   const [addresses, setAddresses] = useState<Address[]>([]);
   const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
   const [paymentMethod, setPaymentMethod] = useState('Online');
   const [deliverySlot, setDeliverySlot] = useState('Express');

   // Address Creation States
   const [isAddingAddress, setIsAddingAddress] = useState(false);
   const [newAddress, setNewAddress] = useState({
      name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false, type: 'Home'
   });

   // Discount States
   const [promoCode, setPromoCode] = useState('');
   const [discount, setDiscount] = useState(0);
   const [discountType, setDiscountType] = useState<string>('');
   const [promoError, setPromoError] = useState('');
   const [promoSuccess, setPromoSuccess] = useState('');

   // Cache order before clearing cart
   const [finalOrderData, setFinalOrderData] = useState<any>(null);

   // Load recommendations for success page
   const { data: recData } = useSWR(`${API_URL}/api/products?limit=4`, fetcher);
   const recommendedProducts = recData?.products ? recData.products.slice(0, 4) : [];

   // Dynamic settings fetch
   const { data: settingsData } = useSWR(`${API_URL}/api/settings`, fetcher);

   const getSettingVal = (key: string, fallback: string) => {
      if (!settingsData || !Array.isArray(settingsData)) return fallback;
      const found = settingsData.find((s: any) => s.key === key);
      return found ? found.value : fallback;
   };

   const gstEnabled = getSettingVal('gst_enabled', 'true') === 'true';
   const defaultGstRate = parseFloat(getSettingVal('gst_default_rate', '18'));
   const gstTaxType = getSettingVal('gst_tax_type', 'exclusive');
   const gstRoundingEnabled = getSettingVal('gst_rounding_enabled', 'true') === 'true';
   const gstTaxLabel = getSettingVal('gst_tax_label', 'GST');

   // Calculate GST dynamically
   let gst = 0;
   if (gstEnabled && cart.length > 0) {
      cart.forEach((item) => {
         const itemRate = item.gstRate !== undefined && item.gstRate !== null ? item.gstRate : defaultGstRate;
         const totalPrice = item.price * item.quantity;
         let itemTax = 0;
         if (gstTaxType === 'inclusive') {
            itemTax = totalPrice - (totalPrice / (1 + itemRate / 100));
         } else {
            itemTax = totalPrice * (itemRate / 100);
         }
         if (gstRoundingEnabled) {
            gst += Math.round(itemTax);
         } else {
            gst += parseFloat(itemTax.toFixed(2));
         }
      });
   }
   if (gstRoundingEnabled) {
      gst = Math.round(gst);
   } else {
      gst = parseFloat(gst.toFixed(2));
   }

   const subtotal = getTotal();
   
   // Fetch dynamic shipping values
   const freeDeliveryAbove = parseFloat(getSettingVal('free_shipping_threshold', '499'));
   const flatDeliveryFee = parseFloat(getSettingVal('delivery_fee', '49'));
   const minOrderForDelivery = parseFloat(getSettingVal('shipping_min_order_amount', '0'));
   
   const delivery = (discountType === 'FREE_SHIPPING' || subtotal >= freeDeliveryAbove) ? 0 : flatDeliveryFee;
   
   let total = 0;
   if (gstTaxType === 'exclusive') {
      total = subtotal - discount + delivery + gst;
   } else {
      total = subtotal - discount + delivery;
   }
   if (total < 0) total = 0;
   if (gstRoundingEnabled) {
      total = Math.round(total);
   } else {
      total = parseFloat(total.toFixed(2));
   }

    const activeGateway = getSettingVal('active_payment_gateway', 'HDFC');
    const paymentMethods = activeGateway === 'Razorpay' ? ['Razorpay'] : ['Online'];

    useEffect(() => {
       if (settingsData) {
          const activeGatewayVal = getSettingVal('active_payment_gateway', 'HDFC');
          if (activeGatewayVal === 'Razorpay' && paymentMethod === 'Online') {
             setPaymentMethod('Razorpay');
          } else if (activeGatewayVal === 'HDFC' && paymentMethod === 'Razorpay') {
             setPaymentMethod('Online');
          }
       }
    }, [settingsData, paymentMethod]);

    useEffect(() => {
       setMounted(true);
       if (user?.id) {
          setEmail(user.email);
          loadAddresses();
       }
    }, [user]);

   const loadAddresses = async () => {
      if (!user?.id) return;
      try {
         const res = await fetch(`${API_URL}/api/addresses/${user.id}`);
         const data = await res.json();
         setAddresses(data);
         const def = data.find((a: Address) => a.isDefault) || data[0];
         if (def) setSelectedAddressId(def.id);
      } catch (e) {
         console.error(e);
      }
   };

   const saveAddress = async () => {
      setIsProcessing(true);
      try {
         const payload = { ...newAddress, userId: user?.id, email: email || 'guest@example.com' };
         const res = await fetch(`${API_URL}/api/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });
         const data = await res.json();
         if (res.ok) {
            setAddresses([...addresses, data]);
            setSelectedAddressId(data.id);
            setIsAddingAddress(false);
            setNewAddress({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false, type: 'Home' });
         }
      } catch (e) {
         console.error(e);
      } finally {
         setIsProcessing(false);
      }
   };

   const applyPromo = async () => {
      if (!promoCode.trim()) return;
      setPromoError(''); setPromoSuccess('');
      try {
         const res = await fetch(`${API_URL}/api/coupons/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: promoCode, userId: user?.id, orderTotal: subtotal, items: cart })
         });
         const data = await res.json();
         if (!res.ok) { setPromoError(data.error); setDiscount(0); return; }
         setDiscount(data.discount);
         setDiscountType(data.type);
         setPromoSuccess(data.message);
      } catch { setPromoError('Failed to validate coupon'); }
   };

   const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);

   const handlePlaceOrder = async () => {
      setIsProcessing(true);
      setPromoError('');
      try {
         const orderRes = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               userId: user?.id,
               email: email || 'guest@example.com',
               shippingAddressId: selectedAddressId,
               totalAmount: total,
               discountAmount: discount,
               gstAmount: gst,
               items: cart,
               paymentMethod: paymentMethod === 'Razorpay' ? 'Razorpay Online' : paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Online',
               couponCode: appliedCoupon?.code || promoCode || null
            })
         });



         const dbOrder = await orderRes.json();
         if (!orderRes.ok) throw new Error(dbOrder.error || 'Failed to create order');
         setConfirmedOrderId(dbOrder.id);

         const commitOrderCache = () => {
            setFinalOrderData({
               items: [...cart],
               subtotal, discount, delivery, gst, total,
               address: addresses.find(a => a.id === selectedAddressId)
            });
         };

         if (paymentMethod === 'Razorpay') {
            const res = await fetch(`${API_URL}/api/payments/razorpay/session`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  amount: total,
                  customerId: user?.id,
                  customerEmail: email || user?.email || '',
                  customerPhone: addresses.find(a => a.id === selectedAddressId)?.phone || '9999999999',
                  dbOrderId: dbOrder.id
               })
            });
            const razorpayOrder = await res.json();
            if (!res.ok) throw new Error(razorpayOrder.error || 'Failed to initialize Razorpay payment');

            const options = {
               key: razorpayOrder.keyId,
               amount: razorpayOrder.amount,
               currency: razorpayOrder.currency,
               name: "Namma Ooru Foods",
               description: "Purchase Order",
               order_id: razorpayOrder.orderId,
               handler: async function (response: any) {
                  try {
                     const verifyRes = await fetch(`${API_URL}/api/payments/razorpay/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                           razorpay_payment_id: response.razorpay_payment_id,
                           razorpay_order_id: response.razorpay_order_id,
                           razorpay_signature: response.razorpay_signature,
                           dbOrderId: dbOrder.id
                        })
                     });
                     const verifyData = await verifyRes.json();
                     if (verifyData.success) {
                        commitOrderCache();
                        clearCart();
                        setStep(4);
                        window.scrollTo(0, 0);
                     } else {
                        setPromoError('Payment verification failed. Please contact support.');
                     }
                  } catch (e) {
                     setPromoError('Payment verification error.');
                  }
               },
               prefill: {
                  name: user?.name || "Guest",
                  email: email || user?.email || "",
                  contact: addresses.find(a => a.id === selectedAddressId)?.phone || ""
               },
               theme: {
                  color: "#16a34a"
               }
            };
            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
               setPromoError('Payment failed: ' + response.error.description);
               setIsProcessing(false);
            });
            rzp1.open();
         } else {
            const res = await fetch(`${API_URL}/api/payments/session`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  amount: total,
                  customerId: user?.id,
                  customerEmail: email || user?.email || '',
                  customerPhone: addresses.find(a => a.id === selectedAddressId)?.phone || '9999999999',
                  returnUrl: `${API_URL}/api/payments/verify`,
                  dbOrderId: dbOrder.id
               })
            });
            const hdfcOrder = await res.json();

            if (!res.ok) throw new Error(hdfcOrder.error || 'Failed to initialize payment');

            if (hdfcOrder.paymentLink) {
               // Redirect to HDFC SmartGateway Secure Checkout
               window.location.href = hdfcOrder.paymentLink;
            } else {
               throw new Error('Payment gateway link could not be generated');
            }
         }
      } catch (error: any) {
         setPromoError(error.message || 'Payment processing failed');
         setIsProcessing(false);
      }
   };

   if (!mounted) return null;

   if (!user) {
      return (
         <div className="bg-gradient-to-br from-[#f0fdf4] to-[#f8f8f5] min-h-[calc(100vh-100px)] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-[1400px] w-full mx-auto">
               <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 min-h-[600px]">
                  
                  {/* LEFT SIDE: Auth Form */}
                  <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center relative">
                     <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#059669] to-[#16a34a]" />
                     <div className="max-w-md mx-auto w-full">
                        <div className="h-16 w-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-sm border border-emerald-100/50">
                           <Lock className="h-8 w-8 text-[#16a34a]" />
                        </div>
                        <h2 className="text-[32px] md:text-[40px] font-black text-[#111827] tracking-tight leading-none mb-4">Secure Checkout</h2>
                        <p className="text-[15px] text-[#6b7280] font-semibold leading-relaxed mb-10">
                           Login to continue your purchase and enjoy farm fresh delivery.
                        </p>

                        <div className="flex flex-col gap-4">
                           <Link href="/account?redirect=/checkout" className="flex items-center justify-center h-[60px] w-full bg-[#111827] text-white rounded-2xl font-bold text-[16px] transition-all hover:bg-[#1f2937] hover:shadow-lg hover:-translate-y-0.5 gap-2" style={{ color: 'white' }}>
                              <Phone size={20} className="text-white" /> <span className="text-white">Continue with Mobile Number</span>
                           </Link>
                           <Link href="/" className="mt-4 text-center text-[15px] font-bold text-[#16a34a] hover:text-[#15803d] transition-colors inline-block">
                              Continue Shopping
                           </Link>
                        </div>
                     </div>
                  </div>

                  {/* RIGHT SIDE: Summary & Benefits */}
                  <div className="bg-[#f8fcf9] p-8 md:p-12 border-l border-slate-100 flex flex-col justify-between">
                     <div>
                        {cart.length > 0 && (
                           <div className="mb-10 bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
                              <div className="flex items-center justify-between mb-4">
                                 <h3 className="font-black text-[#111827] flex items-center gap-2"><ShoppingBag size={18} className="text-[#16a34a]" /> Order Summary</h3>
                                 <span className="text-[12px] font-bold text-[#6b7280] bg-[#f3f4f6] px-3 py-1 rounded-full">{cart.length} Items</span>
                              </div>
                              <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                                 <span className="text-[#6b7280] font-bold text-sm">Cart Total</span>
                                 <span className="text-[24px] font-black text-[#111827]">₹{getTotal()}</span>
                              </div>
                           </div>
                        )}
                     </div>

                     <div>
                        <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-6">Why shop with us?</h4>
                        <div className="grid grid-cols-1 gap-5">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                 <ShieldCheck size={16} className="text-[#16a34a]" />
                              </div>
                              <div>
                                 <p className="text-[14px] font-bold text-[#111827]">Secure Payments</p>
                                 <p className="text-[12px] font-medium text-slate-500">100% encrypted transactions</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                 <Truck size={16} className="text-blue-600" />
                              </div>
                              <div>
                                 <p className="text-[14px] font-bold text-[#111827]">Fast Delivery</p>
                                 <p className="text-[12px] font-medium text-slate-500">Direct from farm to your door</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                 <MapPin size={16} className="text-amber-600" />
                              </div>
                              <div>
                                 <p className="text-[14px] font-bold text-[#111827]">Order Tracking</p>
                                 <p className="text-[12px] font-medium text-slate-500">Real-time status updates</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                 <Sparkles size={16} className="text-purple-600" />
                              </div>
                              <div>
                                 <p className="text-[14px] font-bold text-[#111827]">Fresh Products</p>
                                 <p className="text-[12px] font-medium text-slate-500">Quality checked before dispatch</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      );
   }

   if (placed || step === 4) {
      return (
         <div className="bg-[#f8f8f5] min-h-screen pt-[56px] pb-24">
            <div className="max-w-[720px] mx-auto px-4 sm:px-6">

               {/* HERO SECTION */}
               <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-center flex flex-col items-center mb-10 relative"
               >
                  {/* Confetti Microinteraction Behind Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-[#16a34a]/20 to-[#dcfce7]/20 rounded-full blur-3xl -z-10 animate-pulse" />

                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] flex items-center justify-center mb-6 shadow-[0_12px_40px_rgba(34,197,94,0.3)] border border-white relative">
                     <div className="absolute inset-0 rounded-[2rem] border-2 border-white opacity-50 animate-[ping_3s_ease-in-out_infinite]" />
                     <CheckCircle className="h-10 w-10 text-[#16a34a]" />
                  </div>

                  <h1 className="text-[40px] md:text-[56px] font-black text-[#111827] tracking-tighter leading-none mb-3">Order Confirmed!</h1>
                  <p className="text-[16px] md:text-[18px] text-[#6b7280] font-medium max-w-sm">We've received your order and are preparing your fresh Products for dispatch.</p>

                  <div className="mt-8 inline-flex flex-col items-center gap-1.5 bg-white py-3 px-8 rounded-full border border-[#e5e7eb] shadow-sm">
                     <span className="text-[10px] font-black text-[#9ca3af] uppercase tracking-[0.3em]">Tracking ID</span>
                     <span className="text-[24px] md:text-[32px] font-black text-[#111827] tracking-tight leading-none">
                        #{confirmedOrderId || (Math.floor(Math.random() * 90000) + 10000)}
                     </span>
                  </div>
               </motion.div>

               {/* PROGRESS TRACKER */}
               <div className="bg-white rounded-[24px] p-8 border border-[#e5e7eb] shadow-sm mb-6">
                  <div className="flex justify-between items-center relative">
                     <div className="absolute top-1/2 left-6 right-6 h-1 bg-[#f3f4f6] -translate-y-1/2 rounded-full -z-0" />
                     <div className="absolute top-1/2 left-6 h-1 bg-gradient-to-r from-[#16a34a] to-[#22c55e] w-[15%] -translate-y-1/2 rounded-full z-0" />

                     {['Confirmed', 'Packed', 'Shipped', 'Delivered'].map((stage, idx) => (
                        <div key={stage} className="flex flex-col items-center gap-2 z-10">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${idx === 0 ? 'bg-[#16a34a] text-white shadow-[0_0_0_4px_rgba(22,163,74,0.15)]' : 'bg-[#e5e7eb] text-[#9ca3af]'}`}>
                              {idx === 0 ? <CheckCircle size={14} /> : <div className="w-2 h-2 rounded-full bg-white" />}
                           </div>
                           <span className={`text-[11px] font-bold uppercase tracking-wider hidden sm:block ${idx === 0 ? 'text-[#111827]' : 'text-[#9ca3af]'}`}>{stage}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* DELIVERY ETA BLOCK */}
               <div className="bg-[#f0fdf4] rounded-[24px] p-6 border border-[#bbf7d0]/50 mb-6 flex items-start gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#16a34a]">
                     <Truck size={20} />
                  </div>
                  <div>
                     <h3 className="text-[14px] font-bold text-[#111827] mb-1">Expected Delivery</h3>
                     <p className="text-[20px] font-black text-[#16a34a] tracking-tight">Today • 6:30 PM - 8:00 PM</p>
                     {finalOrderData?.address && (
                        <div className="mt-3 text-[13px] text-[#4b5563] font-medium flex items-start gap-2">
                           <MapPin size={16} className="mt-0.5 text-[#9ca3af]" />
                           <span>Delivering to <strong className="text-[#111827]">{finalOrderData.address.line1}, {finalOrderData.address.city}</strong></span>
                        </div>
                     )}
                  </div>
               </div>

               {/* ORDER SUMMARY */}
               <div className="bg-white rounded-[24px] border border-[#e5e7eb] shadow-sm mb-8 overflow-hidden">
                  <div className="p-6 border-b border-[#f1f5f9] flex items-center justify-between">
                     <h3 className="font-bold text-[#111827] text-lg flex items-center gap-2"><Package size={20} /> Items Ordered</h3>
                     <span className="text-[12px] font-bold text-[#6b7280] bg-[#f8fafc] px-3 py-1 rounded-full">{finalOrderData?.items?.length || 0} Items</span>
                  </div>

                  <div className="p-6">
                     {/* Products List */}
                     <div className="space-y-4 mb-6">
                        {(finalOrderData?.items || []).map((item: any) => (
                           <div key={item.id} className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded-[14px] bg-[#f8f8f5] border border-[#f1f5f9] overflow-hidden shrink-0">
                                 <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-[14px] font-bold text-[#111827] truncate">{item.name}</h4>
                                 <p className="text-[12px] text-[#6b7280] mt-0.5">{item.variant} × {item.quantity}</p>
                              </div>
                              <span className="text-[15px] font-black text-[#111827]">₹{item.price * item.quantity}</span>
                           </div>
                        ))}
                     </div>

                     <div className="h-px w-full bg-[#e5e7eb] mb-5" />

                     {/* Calculations */}
                     <div className="space-y-2.5 text-[14px]">
                        <div className="flex justify-between text-[#6b7280] font-medium"><span>Subtotal</span><span className="text-[#111827] font-bold">₹{finalOrderData?.subtotal || 0}</span></div>
                        <div className="flex justify-between text-[#6b7280] font-medium"><span>Shipping</span><span className="text-[#111827] font-bold">₹{finalOrderData?.delivery || 0}</span></div>
                        {finalOrderData?.discount > 0 && <div className="flex justify-between text-[#16a34a] font-bold"><span>Discount</span><span>-₹{finalOrderData.discount}</span></div>}
                        {gstEnabled && (finalOrderData?.gst || 0) > 0 && (
                           <div className="flex justify-between text-[#6b7280] font-medium">
                              <span>{gstTaxLabel} ({gstTaxType === 'inclusive' ? 'Inclusive' : 'Exclusive'})</span>
                              <span className="text-[#111827] font-bold">₹{finalOrderData?.gst || 0}</span>
                           </div>
                        )}
                     </div>

                     <div className="h-px w-full bg-[#e5e7eb] my-5" />

                     {/* Total */}
                     <div className="flex justify-between items-end">
                        <div>
                           <span className="block text-[14px] font-bold text-[#111827]">Total Paid</span>
                           <span className="text-[11px] text-[#6b7280]">via {paymentMethod}</span>
                        </div>
                        <span className="text-[28px] font-black text-[#111827] tracking-tighter leading-none">₹{finalOrderData?.total || 0}</span>
                     </div>
                  </div>
               </div>

               {/* CTAS */}
               <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
                  <Link href="/account/orders" className="w-full sm:flex-1 h-[58px] rounded-[18px] bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(34,197,94,0.3)] hover:shadow-[0_10px_40px_rgba(34,197,94,0.4)] hover:-translate-y-1 transition-all">
                     Track Your Order
                  </Link>
                  <Link href="/" className="w-full sm:flex-1 h-[58px] rounded-[18px] bg-white text-[#111827] font-bold text-[15px] flex items-center justify-center gap-2 shadow-sm border border-[#e5e7eb] hover:bg-[#f9fafb] transition-all">
                     Continue Shopping
                  </Link>
                  <button className="w-full sm:w-auto h-[58px] px-6 rounded-[18px] bg-[#f8fafc] text-[#4b5563] font-bold text-[14px] flex items-center justify-center gap-2 border border-[#f1f5f9] hover:bg-[#f1f5f9] transition-all">
                     <Download size={18} /> Invoice
                  </button>
               </div>

               {/* RECOMMENDATIONS */}
               {recommendedProducts.length > 0 && (
                  <div className="mb-14">
                     <h3 className="text-[20px] font-black text-[#111827] tracking-tight mb-6">You may also like</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {recommendedProducts.map((product: any) => (
                           <ProductCard key={product.id} product={product} />
                        ))}
                     </div>
                  </div>
               )}

               {/* TRUST FOOTER */}
               <div className="border-t border-[#e5e7eb] pt-8 flex flex-wrap justify-center gap-6 text-[12px] font-bold uppercase tracking-widest text-[#6b7280]">
                  <div className="flex items-center gap-2"><ShieldCheck size={16} /> Secure Payments</div>
                  <div className="flex items-center gap-2"><Sparkles size={16} /> Fresh Product Guarantee</div>
                  <div className="flex items-center gap-2"><MapPin size={16} /> Real-Time Tracking</div>
               </div>

            </div>
         </div>
      );
   }

   const renderStepIndicator = () => (
      <div className="flex items-center justify-center w-full max-w-xl mx-auto mb-8">
         {[{ id: 1, label: 'Cart' }, { id: 2, label: 'Delivery' }, { id: 3, label: 'Payment' }, { id: 4, label: 'Complete' }].map((s, i) => (
            <div key={s.id} className="flex items-center">
               <div className="flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] z-10 transition-all ${step >= s.id ? 'bg-[#16a34a] text-white shadow-[0_0_0_4px_rgba(22,163,74,0.15)]' : 'bg-white border-2 border-[#e5e7eb] text-[#9ca3af]'
                     }`}>
                     {step > s.id ? <CheckCircle size={14} /> : s.id}
                  </div>
                  <span className={`absolute mt-12 text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-[#111827]' : 'text-[#9ca3af]'}`}>
                     {s.label}
                  </span>
               </div>
               {i < 3 && (
                  <div className={`w-6 xs:w-8 sm:w-24 h-1 mx-1 sm:mx-2 rounded-full transition-all ${step > s.id ? 'bg-[#16a34a]' : 'bg-[#e5e7eb]'}`} />
               )}
            </div>
         ))}
      </div>
   );

   return (
      <>
         <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
         <div className="min-h-screen bg-[#f8f8f5] pt-6 md:pt-10 pb-40">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

               {/* Minimal Header */}
               <div className="text-center mb-10">
                  <h1 className="text-[32px] md:text-[42px] font-black text-[#111827] tracking-tight mb-8">Secure Checkout</h1>
                  {renderStepIndicator()}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-12">

                  {/* LEFT SIDE: FLOW (65%) */}
                  <div className="lg:col-span-7 flex flex-col gap-8">
                     <AnimatePresence mode="wait">

                        {/* STEP 2: DELIVERY */}
                        {step === 2 && (
                           <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">

                              {/* Authentication Trap for Guests */}
                              {!user && (
                                 <div className="bg-white rounded-[24px] p-6 border border-[#e5e7eb] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                       <h3 className="font-bold text-[#111827]">Checking out as Guest</h3>
                                       <p className="text-[12px] text-[#6b7280]">We'll send order updates to this email.</p>
                                    </div>
                                    <input
                                       type="email"
                                       placeholder="Enter email address"
                                       className="h-[48px] px-4 w-full sm:w-64 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 outline-none transition-all text-sm font-semibold text-[#111827]"
                                       value={email}
                                       onChange={e => setEmail(e.target.value)}
                                    />
                                 </div>
                              )}

                              <div className="flex items-center justify-between">
                                 <h2 className="text-[24px] font-black text-[#111827] tracking-tight">Delivery Address</h2>
                              </div>

                              {/* SAVED ADDRESSES GRID */}
                              {addresses.length > 0 && !isAddingAddress && (
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {addresses.map(addr => (
                                       <div
                                          key={addr.id}
                                          onClick={() => setSelectedAddressId(addr.id)}
                                          className={`p-5 rounded-[20px] border-2 transition-all cursor-pointer relative ${selectedAddressId === addr.id ? 'border-[#16a34a] bg-[#f0fdf4]' : 'border-[#e5e7eb] bg-white hover:border-[#16a34a]/50'}`}
                                       >
                                          <div className="flex items-center justify-between mb-2">
                                             <div className="flex items-center gap-2">
                                                {addr.type === 'Home' ? <Home size={14} className="text-[#6b7280]" /> : <Briefcase size={14} className="text-[#6b7280]" />}
                                                <h4 className="font-bold text-[#111827] text-sm">{addr.type || 'Home'}</h4>
                                             </div>
                                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr.id ? 'border-[#16a34a] bg-[#16a34a]' : 'border-[#d1d5db]'}`}>
                                                {selectedAddressId === addr.id && <CheckCircle size={12} className="text-white" />}
                                             </div>
                                          </div>
                                          <p className="font-bold text-[#111827] text-sm mb-1">{addr.name} • {addr.phone}</p>
                                          <p className="text-[#6b7280] text-[13px] leading-relaxed line-clamp-2">{addr.line1}, {addr.city}</p>
                                       </div>
                                    ))}
                                 </div>
                              )}

                              {/* ADD NEW ADDRESS FORM */}
                              {(isAddingAddress || addresses.length === 0) ? (
                                 <div className="bg-white rounded-[24px] p-6 border border-[#e5e7eb] shadow-sm space-y-5">
                                    <h3 className="font-bold text-[#111827] text-lg mb-4">Add New Location</h3>

                                    <div className="flex gap-3 mb-2">
                                       {['Home', 'Office', 'Other'].map(t => (
                                          <button
                                             key={t} onClick={() => setNewAddress({ ...newAddress, type: t })}
                                             className={`px-4 py-2 rounded-full text-[12px] font-bold border transition-all ${newAddress.type === t ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#e5e7eb] bg-white text-[#6b7280]'}`}
                                          >{t}</button>
                                       ))}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                       <input
                                          placeholder="Full Name" type="text"
                                          className="h-[56px] px-5 rounded-[18px] bg-white border border-[#e5e7eb] focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 outline-none transition-all text-[15px] font-semibold text-[#111827]"
                                          value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                                       />
                                       <input
                                          placeholder="Phone Number" type="text"
                                          className="h-[56px] px-5 rounded-[18px] bg-white border border-[#e5e7eb] focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 outline-none transition-all text-[15px] font-semibold text-[#111827]"
                                          value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                       />
                                    </div>
                                    <input
                                       placeholder="Street Address / Building" type="text"
                                       className="w-full h-[56px] px-5 rounded-[18px] bg-white border border-[#e5e7eb] focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 outline-none transition-all text-[15px] font-semibold text-[#111827]"
                                       value={newAddress.line1} onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-5">
                                       <input
                                          placeholder="City" type="text"
                                          className="h-[56px] px-5 rounded-[18px] bg-white border border-[#e5e7eb] focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 outline-none transition-all text-[15px] font-semibold text-[#111827]"
                                          value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                       />
                                       <input
                                          placeholder="Pincode" type="text"
                                          className="h-[56px] px-5 rounded-[18px] bg-white border border-[#e5e7eb] focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 outline-none transition-all text-[15px] font-semibold text-[#111827]"
                                          value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                       />
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                       <button
                                          onClick={saveAddress} disabled={isProcessing || !newAddress.name || !newAddress.line1 || !newAddress.phone}
                                          className="h-[56px] px-8 rounded-[18px] bg-gradient-to-r from-[#059669] to-[#16a34a] text-white font-bold text-sm shadow-[0_4px_14px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                       >Save Address</button>
                                       {addresses.length > 0 && (
                                          <button onClick={() => setIsAddingAddress(false)} className="h-[56px] px-6 rounded-[18px] font-bold text-sm text-[#6b7280] hover:bg-[#f3f4f6] transition-all">Cancel</button>
                                       )}
                                    </div>
                                 </div>
                              ) : (
                                 <button
                                    onClick={() => setIsAddingAddress(true)}
                                    className="h-[56px] w-full rounded-[18px] border-2 border-dashed border-[#d1d5db] flex items-center justify-center gap-2 text-[#6b7280] font-bold text-sm hover:border-[#16a34a] hover:text-[#16a34a] hover:bg-[#f0fdf4] transition-all"
                                 >
                                    <Plus size={18} /> Add New Address
                                 </button>
                              )}


                              <div className="pt-6">
                                 <button
                                    onClick={() => setStep(3)}
                                    disabled={!selectedAddressId || (!user && !email)}
                                    className="w-full h-[60px] rounded-[18px] bg-gradient-to-r from-[#059669] to-[#16a34a] text-white font-bold text-lg flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(22,163,74,0.3)] hover:shadow-[0_10px_40px_rgba(22,163,74,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                                 >
                                    Continue to Payment <ChevronRight size={20} />
                                 </button>
                              </div>
                           </motion.div>
                        )}

                        {/* STEP 3: PAYMENT */}
                        {step === 3 && (
                           <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                              <div className="flex items-center justify-between">
                                 <h2 className="text-[24px] font-black text-[#111827] tracking-tight">Payment Method</h2>
                                 <button onClick={() => setStep(2)} className="text-sm font-bold text-[#16a34a] hover:underline">Edit Delivery</button>
                              </div>

                               <div className="space-y-4">
                                 {paymentMethods.map((method) => (
                                    <div
                                       key={method}
                                       onClick={() => setPaymentMethod(method)}
                                       className={`p-6 rounded-[20px] border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === method ? 'border-[#16a34a] bg-[#f0fdf4]' : 'border-[#e5e7eb] bg-white hover:border-[#16a34a]/30'}`}
                                    >
                                       <div className="flex items-center gap-4">
                                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method === 'Online' || method === 'Razorpay' ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                                             <CreditCard size={20} />
                                          </div>
                                          <div>
                                             <h4 className="font-bold text-[#111827] text-[15px]">{method === 'Online' ? 'HDFC SmartGateway (Cards/UPI)' : method === 'Razorpay' ? 'Razorpay (Cards/UPI/NetBanking)' : 'Pay on Delivery'}</h4>
                                             <p className="text-[12px] text-[#6b7280] font-medium">{method === 'Online' || method === 'Razorpay' ? 'Instant & secure digital settlement' : 'Pay via cash or UPI at your doorstep'}</p>
                                          </div>
                                       </div>
                                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? 'border-[#16a34a] bg-[#16a34a]' : 'border-[#d1d5db]'}`}>
                                          {paymentMethod === method && <CheckCircle size={14} className="text-white" />}
                                       </div>
                                    </div>
                                 ))}
                              </div>

                              <button
                                 onClick={handlePlaceOrder}
                                 disabled={isProcessing}
                                 className="w-full h-[60px] rounded-[18px] bg-gradient-to-r from-[#059669] to-[#16a34a] text-white font-bold text-lg flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(22,163,74,0.3)] hover:shadow-[0_10px_40px_rgba(22,163,74,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50"
                              >
                                 {isProcessing ? <><RefreshCw size={20} className="animate-spin" /> Processing...</> : <><Lock size={18} /> Pay ₹{total}</>}
                              </button>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>

                  {/* RIGHT SIDE: SUMMARY (35%) */}
                  <div className="lg:col-span-5">
                     <div className="bg-white rounded-[24px] border border-[#e5e7eb] shadow-[0_4px_24px_rgba(0,0,0,0.04)] lg:sticky lg:top-24 overflow-hidden">

                        <div className="p-6 bg-[#fcfdfb] border-b border-[#f1f5f9]">
                           <h3 className="font-bold text-[#111827] text-lg">Order Summary</h3>
                        </div>

                        <div className="p-6">
                           {/* PRODUCT PREVIEWS */}
                           <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar mb-6 pr-2">
                              {cart.map(item => (
                                 <div key={`${item.productId}-${item.variant}`} className="flex items-center gap-4">
                                    <div className="h-[72px] w-[72px] rounded-[14px] bg-[#f8f8f5] border border-[#f1f5f9] overflow-hidden shrink-0 relative">
                                       <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                       <span className="absolute top-1 right-1 bg-white/90 backdrop-blur text-[#111827] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{item.quantity}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <h4 className="text-[14px] font-bold text-[#111827] truncate">{item.name}</h4>
                                       <p className="text-[12px] text-[#6b7280] mt-0.5">{item.variant}</p>
                                    </div>
                                    <span className="text-[15px] font-black text-[#111827]">₹{item.price * item.quantity}</span>
                                 </div>
                              ))}
                           </div>

                           {/* CALCULATION BLOCKS */}
                           <div className="space-y-3 pt-2 text-[14px]">
                              <div className="flex justify-between text-[#6b7280] font-medium">
                                 <span>Subtotal</span>
                                 <span className="text-[#111827] font-bold">₹{subtotal}</span>
                              </div>
                              {gstEnabled && gst > 0 && (
                                 <div className="flex justify-between text-[#6b7280] font-medium">
                                    <span>{gstTaxLabel} ({gstTaxType === 'inclusive' ? 'Inclusive' : 'Exclusive'})</span>
                                    <span className="text-[#111827] font-bold">₹{gst}</span>
                                 </div>
                              )}
                              {discount > 0 && (
                                 <div className="flex justify-between text-[#16a34a] font-bold">
                                    <span>Coupon Savings</span>
                                    <span>-₹{discount}</span>
                                 </div>
                              )}
                              {/* DELIVERY FEE */}
                              <div className="flex flex-col gap-1">
                                 <div className="flex justify-between text-[#6b7280] font-medium items-center">
                                    <div className="flex items-center gap-1 group relative">
                                       <span>Delivery Fee</span>
                                       <div className="text-slate-400 hover:text-slate-600 cursor-help p-1 relative">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                          {/* Tooltip */}
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#111827] text-white text-[11px] p-3 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-[#111827]">
                                             <div className="space-y-1.5">
                                                <div className="flex justify-between"><span className="text-slate-300">Flat Delivery Fee:</span> <span className="font-bold">₹{flatDeliveryFee}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-300">Free Delivery Above:</span> <span className="font-bold">₹{freeDeliveryAbove}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-300">Standard Delivery:</span> <span className="font-bold">1-3 Days</span></div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       {delivery === 0 ? (
                                          <>
                                             <span className="text-slate-400 line-through text-[12px]">₹{flatDeliveryFee}</span>
                                             <span className="text-[#16a34a] font-black uppercase tracking-wider text-[12px]">FREE</span>
                                          </>
                                       ) : (
                                          <span className="text-[#111827] font-bold">₹{flatDeliveryFee}</span>
                                       )}
                                    </div>
                                 </div>
                                 
                                 {delivery === 0 ? (
                                    <div className="text-[11px] font-bold text-[#16a34a] bg-[#16a34a]/10 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 mt-1 w-fit">
                                       <span>🚚</span> Free Delivery Applied!
                                    </div>
                                 ) : (
                                    <div className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 mt-1 w-fit border border-amber-100/50">
                                       Add <span className="font-black">₹{(freeDeliveryAbove - subtotal).toFixed(2)}</span> more to unlock <span className="uppercase tracking-wider font-black">FREE delivery</span>
                                    </div>
                                 )}
                              </div>
                           </div>

                           <div className="h-px w-full bg-[#e5e7eb] my-5" />

                           {/* FINAL TOTAL */}
                           <div className="flex justify-between items-end mb-6">
                              <div>
                                 <span className="block text-[14px] font-bold text-[#111827]">Total to Pay</span>
                                 <span className="text-[11px] text-[#6b7280]">
                                    {gstEnabled ? `Inclusive of ${gstTaxLabel}` : 'Inclusive of all taxes'}
                                 </span>
                              </div>
                              <span className="text-[32px] font-black text-[#111827] tracking-tighter leading-none">₹{total}</span>
                           </div>

                           {/* SECURITY BLOCK */}
                           <div className="bg-[#f8fafc] rounded-[16px] p-4 flex items-center gap-3 border border-[#f1f5f9]">
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 text-[#64748b]">
                                 <ShieldCheck size={20} />
                              </div>
                              <div className="flex-1">
                                 <button className="h-[34px] px-4 bg-slate-100 text-slate-600 font-bold text-[12px] uppercase tracking-wider rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                    onClick={async () => {
                                       try {
                                          const res = await fetch(`${API_URL}/api/coupons/validate`, {
                                             method: 'POST',
                                             headers: { 'Content-Type': 'application/json' },
                                             body: JSON.stringify({ code: promoCode, userId: user?.id, orderTotal: subtotal, items: cart })
                                          });
                                          const data = await res.json();
                                          if (!res.ok) {
                                             setPromoError(data.error);
                                             setDiscount(0);
                                             setAppliedCoupon(null);
                                             return;
                                          }
                                          setDiscount(data.discount);
                                          setDiscountType(data.type);
                                          setPromoSuccess(data.message);
                                          setAppliedCoupon({ code: promoCode, discount: data.discount, type: data.type, message: data.message });
                                       } catch {
                                          setPromoError('Failed to validate coupon');
                                          setAppliedCoupon(null);
                                       }
                                    }}
                                 >Apply</button>
                                 {promoError && (<p className="text-red-600 text-[12px] mt-1">{promoError}</p>)}
                                 {promoSuccess && (<p className="text-green-600 text-[12px] mt-1">{promoSuccess}</p>)}
                                 <p className="text-[11px] text-[#64748b]">100% secure encrypted payment</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>

            {/* MOBILE STICKY CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-[#e5e7eb] z-50 px-4 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
               <div className="flex items-center justify-between mb-3">
                  <div>
                     <p className="text-[12px] font-bold text-[#6b7280]">Total Due</p>
                     <p className="text-[20px] font-black text-[#111827] leading-none mt-1">₹{total}</p>
                  </div>
                  <button onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)} className="text-[12px] font-bold text-[#16a34a] flex items-center gap-1">
                     View Details {isMobileSummaryOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
               </div>

               <AnimatePresence>
                  {isMobileSummaryOpen && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pb-4 space-y-2 text-[13px] border-b border-[#e5e7eb] mb-4">
                           <div className="flex justify-between text-[#6b7280]"><span>Subtotal</span><span className="font-bold text-[#111827]">₹{subtotal}</span></div>
                           <div className="flex justify-between text-[#6b7280]"><span>Delivery</span><span className="font-bold text-[#111827]">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
                           {gstEnabled && gst > 0 && (
                               <div className="flex justify-between text-[#6b7280]">
                                  <span>{gstTaxLabel} ({gstTaxType === 'inclusive' ? 'Incl' : 'Excl'})</span>
                                  <span className="font-bold text-[#111827]">₹{gst}</span>
                               </div>
                            )}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>

               <button
                  onClick={() => { if (step === 3) handlePlaceOrder(); else setStep(step + 1); }}
                  disabled={isProcessing || (step === 2 && !selectedAddressId)}
                  className="w-full h-[54px] rounded-[16px] bg-gradient-to-r from-[#059669] to-[#16a34a] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
               >
                  {isProcessing ? 'Processing...' : step === 3 ? `Pay ₹${total}` : 'Continue to Payment'} <ChevronRight size={18} />
               </button>
            </div>

         </div>
      </>
   );
}
