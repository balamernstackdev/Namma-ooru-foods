'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Tag, 
  CheckCircle, 
  RefreshCw, 
  MapPin, 
  Plus, 
  ChevronDown, 
  ArrowLeft, 
  ChevronRight,
  User,
  CreditCard,
  Lock,
  Zap,
  Star
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Script from 'next/script';
import { API_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Address { id: number; name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string; isDefault: boolean; }

export default function ElasticCheckout() {
  const { cart, getTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Identity, 2: Delivery, 3: Payment
  const [placed, setPlaced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Online Payment (Razorpay)');
  
  // Address Creation States
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Discount States
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<string>('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [mounted, setMounted] = useState(false);

  const subtotal = getTotal();
  const delivery = (discountType === 'FREE_SHIPPING' || subtotal >= 499) ? 0 : 49;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal - discount + delivery + gst;

  useEffect(() => {
    setMounted(true);
    if (user?.id) {
       setEmail(user.email);
       setStep(2); // Auto-skip Identity if logged in
       loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/api/addresses/${user.id}`);
      const data = await res.json();
      setAddresses(data);
      const def = data.find((a: Address) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
    } catch (e) {
      console.error(e);
    }
  };

  const saveAddress = async () => {
    if (!user?.id && !email) {
      setPromoError('Please provide an email in Step 1 first.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAddress, userId: user?.id, email: email })
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses([...addresses, data]);
        setSelectedAddressId(data.id);
        setIsAddingAddress(false);
        setNewAddress({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError('');
    setPromoSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, userId: user?.id, orderTotal: subtotal })
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
      // 1. Create the Order in our DB first
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: email,
          shippingAddressId: selectedAddressId,
          totalAmount: total,
          discountAmount: discount,
          gstAmount: gst,
          items: cart,
          paymentMethod: paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Online'
        })
      });
      
      const dbOrder = await orderRes.json();
      if (!orderRes.ok) throw new Error(dbOrder.error || 'Failed to create order');
      setConfirmedOrderId(dbOrder.id);

      if (paymentMethod === 'Cash on Delivery') {
        setPlaced(true);
        clearCart();
        return;
      }

      // 2. If Online, process payment
      const res = await fetch(`${API_URL}/api/payments/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, receipt: `order_${dbOrder.id}` })
      });
      const razOrder = await res.json();
      
      const options = {
        key: razOrder.key_id,
        amount: razOrder.amount,
        currency: razOrder.currency,
        name: 'Namma Orru Foods',
        order_id: razOrder.id,
        handler: async function (response: any) {
          const verifyRes = await fetch(`${API_URL}/api/payments/verify`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, ourOrderId: dbOrder.id })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) { setPlaced(true); clearCart(); }
        },
        prefill: { name: user?.name || 'Customer', email: email || user?.email || '' },
        theme: { color: '#022c22' }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
       console.error(error);
       setPromoError(error.message || 'Payment processing failed');
    } finally { setIsProcessing(false); }
  };

  if (!mounted) return null;

  if (placed) {
    return (
      <div className="flex min-h-[90vh] items-center justify-center bg-white px-6">
        <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="text-center max-w-sm"
        >
          <div className="mx-auto w-24 h-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center mb-8 border-2 border-emerald-100">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-[#022c22] uppercase tracking-tighter">Harvest Confirmed!</h1>
          <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[11px]">Supporting local clusters with every bite.</p>
          <div className="mt-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Tracking Ledger ID</span>
             <p className="font-black text-emerald-950 text-2xl tracking-tighter">#ORD-{confirmedOrderId || (Math.floor(Math.random() * 90000) + 10000)}</p>
          </div>
          <div className="flex flex-col gap-3 mt-10">
            <Link href="/account/orders" className="h-16 rounded-2xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20">
              Live Logistics Tracking
            </Link>
            <Link href="/" className="h-16 rounded-2xl border-2 border-slate-100 text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center hover:bg-slate-50 transition-all">
              Return to Hub
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* 3-Step Elastic Progress Bar */}
      <div className="fixed top-[56px] left-0 right-0 z-40 bg-white border-b border-slate-100 flex h-2">
         <div className={`h-full bg-emerald-600 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
      </div>

      <div className="min-h-screen bg-slate-50/50 pb-40">
         <div className="standard-container pt-20 pb-10">
            
            {/* Header */}
            <div className="flex items-center gap-6 mb-12">
               <button 
                  onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}
                  className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-emerald-950 hover:bg-slate-50 transition-all"
               >
                  <ArrowLeft size={20} />
               </button>
               <div>
                  <h1 className="text-3xl font-black text-emerald-950 uppercase tracking-tighter leading-none">
                     {step === 1 ? 'Who are you?' : step === 2 ? 'Delivery Node' : 'Final Alignment'}
                  </h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Elastic Protocol Step {step} of 3</p>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               
               {/* Main Flow */}
               <div className="lg:col-span-2">
                  <AnimatePresence mode="wait">
                     
                     {/* STEP 1: IDENTITY */}
                     {step === 1 && (
                        <motion.div 
                           key="step1"
                           initial={{ x: 20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           exit={{ x: -20, opacity: 0 }}
                           className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-premium"
                        >
                           <div className="flex items-center gap-4 mb-10">
                              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><User size={24} /></div>
                              <h2 className="text-xl font-black text-emerald-950 uppercase tracking-tight">Identity Synchronization</h2>
                           </div>

                           <div className="space-y-8">
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address (For Secure Receipt)</label>
                                 <input 
                                    type="email" 
                                    placeholder="yourname@example.com"
                                    className="w-full h-18 px-8 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-400 outline-none transition-all font-bold text-emerald-950"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                 />
                              </div>

                              <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 flex items-center gap-6">
                                 <Zap className="text-amber-500 shrink-0" size={24} />
                                 <p className="text-[11px] font-bold text-amber-900 uppercase tracking-widest leading-relaxed">
                                    Continuing as a guest. You can sync this order to a permanent account after checkout for loyalty rewards.
                                 </p>
                              </div>

                              <button 
                                 onClick={() => setStep(2)}
                                 disabled={!email.includes('@')}
                                 className="w-full h-18 rounded-2xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all disabled:opacity-50"
                              >
                                 Continue to Delivery <ChevronRight size={18} className="text-amber-400" />
                              </button>
                              
                              <div className="text-center pt-4">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Already a harvester? <span className="text-emerald-700 underline cursor-pointer">Login to sync</span></p>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {/* STEP 2: DELIVERY */}
                     {step === 2 && (
                        <motion.div 
                           key="step2"
                           initial={{ x: 20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           exit={{ x: -20, opacity: 0 }}
                           className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-premium"
                        >
                           <div className="flex items-center gap-4 mb-10">
                              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><MapPin size={24} /></div>
                              <h2 className="text-xl font-black text-emerald-950 uppercase tracking-tight">Logistics Hub</h2>
                           </div>

                           <div className="space-y-6">
                              {addresses.map(addr => (
                                 <div 
                                    key={addr.id}
                                    onClick={() => setSelectedAddressId(addr.id)}
                                    className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer relative group ${selectedAddressId === addr.id ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                                 >
                                    <div className="flex items-center justify-between">
                                       <h4 className="font-black text-emerald-950 text-lg tracking-tight">{addr.name}</h4>
                                       <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedAddressId === addr.id ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'}`}>
                                          {selectedAddressId === addr.id && <CheckCircle className="text-white h-4 w-4" />}
                                       </div>
                                    </div>
                                    <p className="text-slate-400 font-bold text-xs mt-2">{addr.phone}</p>
                                    <p className="text-slate-500 font-medium text-sm mt-4 leading-relaxed">{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                    
                                    {selectedAddressId === addr.id && (
                                       <motion.div layoutId="addr-badge" className="absolute -top-3 -right-3 bg-amber-400 text-emerald-950 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">Active Node</motion.div>
                                    )}
                                 </div>
                              ))}

                               {isAddingAddress ? (
                                <motion.div 
                                   initial={{ y: 10, opacity: 0 }}
                                   animate={{ y: 0, opacity: 1 }}
                                   className="p-10 rounded-[2.5rem] bg-slate-50 border-2 border-emerald-100 space-y-6"
                                >
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                                         <input 
                                            type="text" 
                                            className="w-full h-14 px-6 rounded-xl bg-white border border-slate-200 focus:border-emerald-400 outline-none transition-all font-bold text-sm"
                                            value={newAddress.name}
                                            onChange={e => setNewAddress({...newAddress, name: e.target.value})}
                                         />
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone Number</label>
                                         <input 
                                            type="text" 
                                            className="w-full h-14 px-6 rounded-xl bg-white border border-slate-200 focus:border-emerald-400 outline-none transition-all font-bold text-sm"
                                            value={newAddress.phone}
                                            onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                                         />
                                      </div>
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Street Address (Node Location)</label>
                                      <input 
                                         type="text" 
                                         className="w-full h-14 px-6 rounded-xl bg-white border border-slate-200 focus:border-emerald-400 outline-none transition-all font-bold text-sm"
                                         value={newAddress.line1}
                                         onChange={e => setNewAddress({...newAddress, line1: e.target.value})}
                                      />
                                   </div>
                                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                      <div className="space-y-2">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">City</label>
                                         <input 
                                            type="text" 
                                            className="w-full h-14 px-6 rounded-xl bg-white border border-slate-200 focus:border-emerald-400 outline-none transition-all font-bold text-sm"
                                            value={newAddress.city}
                                            onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                                         />
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">State</label>
                                         <input 
                                            type="text" 
                                            className="w-full h-14 px-6 rounded-xl bg-white border border-slate-200 focus:border-emerald-400 outline-none transition-all font-bold text-sm"
                                            value={newAddress.state}
                                            onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                                         />
                                      </div>
                                      <div className="col-span-2 md:col-span-1 space-y-2">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Pincode</label>
                                         <input 
                                            type="text" 
                                            className="w-full h-14 px-6 rounded-xl bg-white border border-slate-200 focus:border-emerald-400 outline-none transition-all font-bold text-sm"
                                            value={newAddress.pincode}
                                            onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                                         />
                                      </div>
                                   </div>
                                   <div className="flex gap-4 pt-4">
                                      <button 
                                         onClick={saveAddress}
                                         disabled={isProcessing || !newAddress.name || !newAddress.phone || !newAddress.line1 || !newAddress.city}
                                         className="flex-1 h-14 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                                      >
                                         Confirm Address
                                      </button>
                                      <button 
                                         onClick={() => setIsAddingAddress(false)}
                                         className="px-8 h-14 rounded-xl border-2 border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                                      >
                                         Cancel
                                      </button>
                                   </div>
                                </motion.div>
                              ) : (
                                <button 
                                   onClick={() => setIsAddingAddress(true)}
                                   className="w-full h-18 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center gap-4 text-slate-400 hover:border-emerald-400 hover:text-emerald-700 transition-all group"
                                >
                                   <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50"><Plus size={20} /></div>
                                   <span className="text-[11px] font-black uppercase tracking-widest">Map New Location</span>
                                </button>
                              )}

                              <button 
                                 onClick={() => setStep(3)}
                                 disabled={!selectedAddressId}
                                 className="w-full h-18 rounded-2xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all disabled:opacity-50 mt-10"
                              >
                                 Finalize & Pay <ChevronRight size={18} className="text-amber-400" />
                              </button>
                           </div>
                        </motion.div>
                     )}

                     {/* STEP 3: PAYMENT */}
                     {step === 3 && (
                        <motion.div 
                           key="step3"
                           initial={{ x: 20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           exit={{ x: -20, opacity: 0 }}
                           className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-premium"
                        >
                           <div className="flex items-center gap-4 mb-10">
                              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><CreditCard size={24} /></div>
                              <h2 className="text-xl font-black text-emerald-950 uppercase tracking-tight">Settlement Engine</h2>
                           </div>

                           <div className="space-y-6">
                              {['Online Payment (Razorpay)', 'Cash on Delivery'].map((method) => (
                                 <div 
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === method ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                                 >
                                    <div className="flex items-center gap-6">
                                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${method.includes('Razorpay') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                          <CreditCard size={24} />
                                       </div>
                                       <div>
                                          <p className="font-black text-emerald-950 uppercase tracking-widest text-sm">{method === 'Online Payment (Razorpay)' ? 'Digitial Gateway' : 'Base Settlement'}</p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{method === 'Online Payment (Razorpay)' ? 'Secure UPI / Cards / Net' : 'Pay at harvest reach'}</p>
                                       </div>
                                    </div>
                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === method ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'}`}>
                                       {paymentMethod === method && <CheckCircle className="text-white h-4 w-4" />}
                                    </div>
                                 </div>
                              ))}

                              <div className="p-10 rounded-[2.5rem] bg-emerald-950 text-white space-y-8 mt-10 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
                                 <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full translate-x-10 -translate-y-10" />
                                 <div className="flex justify-between items-end border-b border-white/10 pb-6">
                                    <div>
                                       <span className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.2em]">Platform Final Total</span>
                                       <h3 className="text-5xl font-black tracking-tighter mt-2">₹{total}</h3>
                                    </div>
                                    <div className="text-right">
                                       <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Inclusive of taxes</span>
                                       <div className="flex items-center gap-2 justify-end mt-2 text-amber-400">
                                          <Lock size={12} /> <span className="text-[10px] font-black uppercase">Secure 256-bit</span>
                                       </div>
                                    </div>
                                 </div>

                                 <button 
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                    className="w-full h-20 rounded-[1.5rem] bg-white text-emerald-950 font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-amber-400 transition-all active:scale-95 shadow-xl shadow-white/5"
                                 >
                                    {isProcessing ? <><RefreshCw size={24} className="animate-spin" /> Verifying Node...</> : <><ShieldCheck size={24} /> Commit Settlement</>}
                                 </button>
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>

               {/* Sidebar Summary */}
               <div className="lg:col-span-1">
                  <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm sticky top-24">
                     <h3 className="text-xl font-black text-emerald-950 uppercase tracking-tight mb-8">Cart Inventory</h3>
                     
                     <div className="space-y-6 max-h-[40vh] overflow-y-auto no-scrollbar pr-2 mb-10">
                        {cart.map(item => (
                           <div key={`${item.productId}-${item.variant}`} className="flex items-center gap-4 group">
                              <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                 <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[12px] font-black text-emerald-950 uppercase tracking-tighter truncate">{item.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.variant} × {item.quantity}</p>
                              </div>
                              <span className="text-sm font-black text-emerald-950">₹{item.price * item.quantity}</span>
                           </div>
                        ))}
                     </div>

                     <div className="space-y-4 pt-8 border-t border-slate-100">
                        <div className="flex justify-between text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                           <span>Base Harvest</span>
                           <span className="text-emerald-950">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                           <span>Platform GST</span>
                           <span className="text-emerald-950">₹{gst}</span>
                        </div>
                        {discount > 0 && (
                           <div className="flex justify-between text-emerald-600 font-bold text-[11px] uppercase tracking-widest">
                              <span>Benefit</span>
                              <span>-₹{discount}</span>
                           </div>
                        )}
                        <div className="flex justify-between text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                           <span>Logistics</span>
                           <span className="text-emerald-950">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
                        </div>
                     </div>

                     <div className="mt-8">
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              placeholder="Coupon Code"
                              className="flex-1 h-12 px-6 rounded-xl bg-slate-50 border-2 border-transparent focus:border-amber-400 outline-none font-bold text-[10px] transition-all uppercase tracking-widest"
                              value={promoCode}
                              onChange={e => setPromoCode(e.target.value)}
                           />
                           <button 
                              onClick={applyPromo}
                              className="h-12 px-6 rounded-xl bg-emerald-950 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-800 transition-all"
                           >
                              Apply
                           </button>
                        </div>
                        {promoSuccess && <p className="text-[9px] font-black text-emerald-600 mt-2 uppercase tracking-widest">✓ {promoSuccess}</p>}
                        {promoError && <p className="text-[9px] font-black text-red-500 mt-2 uppercase tracking-widest">{promoError}</p>}
                     </div>

                     <div className="mt-10 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                        <ShieldCheck className="text-amber-400" size={24} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                           Your data is secured with AES-256 bank-grade protocol.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         
         {/* Thumb-First Mobile Navigation (Checkout Context) */}
         <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
            <div className="bg-emerald-950 rounded-[2rem] p-5 flex items-center justify-between shadow-2xl shadow-emerald-950/40 border border-white/10">
               <div>
                  <span className="text-[9px] font-black text-emerald-300/60 uppercase tracking-widest block mb-1">Total Payload</span>
                  <span className="text-2xl font-black text-white tracking-tighter">₹{total}</span>
               </div>
               <button 
                  onClick={() => {
                     if (step === 3) handlePlaceOrder();
                     else setStep(step + 1);
                  }}
                  disabled={isProcessing || (step === 2 && !selectedAddressId) || (step === 1 && !email.includes('@'))}
                  className="h-14 px-8 bg-amber-400 text-emerald-950 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-amber-400/20"
               >
                  {isProcessing ? 'Verifying...' : step === 3 ? 'Place Order' : 'Next Step'} <ChevronRight size={18} />
               </button>
            </div>
         </div>
      </div>
    </>
  );
}
