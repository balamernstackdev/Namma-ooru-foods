'use client';

import { useEffect, useState } from 'react';
import {
   Truck, Package, MapPin, CheckCircle, Clock, ChevronLeft,
   Search, ExternalLink as ExternalLinkIcon, Check,
   CreditCard, Calendar, ShoppingBag, Loader2, Info, X, Download
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

interface InvoiceModalProps {
   order: any;
   onClose: () => void;
   gstTaxLabel: string;
}

function InvoiceModal({ order, onClose, gstTaxLabel }: InvoiceModalProps) {
   const items = order.orderItems || order.items || [];
   const storedShippingFee = Number(order.shippingFees || order.deliveryFee || 0);

   let totalWeightKg = 0;
   items.forEach((item: any) => {
      const qty = Number(item.quantity || 0);
      let wVal = null;
      let uVal = null;

      // 1. Try parsing weight from variant (e.g. "250g", "1 kg")
      const variantStr = item.variant || item.variantName || '';
      if (variantStr) {
         const match = variantStr.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(g|gm|grams|kg|kgs|kilo|kilograms)/i);
         if (match) {
            wVal = parseFloat(match[1]);
            uVal = match[2];
         }
      }

      // 2. Fallback to product weight and unit fields
      if ((wVal === null || wVal === undefined || wVal === 0) && item.product) {
         wVal = item.product.weight ? Number(item.product.weight) : null;
         uVal = item.product.unit || 'g';

         // 3. Fallback to parsing weight from product name
         if ((wVal === null || wVal === undefined || wVal === 0) && item.product.name) {
            const match = item.product.name.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(g|gm|grams|kg|kgs|kilo|kilograms)/i);
            if (match) {
               wVal = parseFloat(match[1]);
               uVal = match[2];
            }
         }
      }

      if (wVal && uVal) {
         const normUnit = uVal.toLowerCase().trim();
         if (normUnit.startsWith('k') || normUnit.startsWith('kilo')) {
            totalWeightKg += wVal * qty;
         } else {
            totalWeightKg += (wVal / 1000) * qty;
         }
      } else {
         // Fallback: assume 0.5 kg (500g) per item if no weight can be parsed
         totalWeightKg += 0.5 * qty;
      }
   });

   // Derive display shipping fee from weight when stored fee is 0
   // Formula matches backend: ceil(totalWeightKg) × ₹50 per kg
   const calculatedShippingFee = Math.max(1, Math.ceil(totalWeightKg)) * 50;
   const shippingFees = storedShippingFee > 0 ? storedShippingFee : calculatedShippingFee;
   const subtotal = Number(order.totalAmount) - Number(order.gstAmount || 0) - storedShippingFee + Number(order.discountAmount || 0);
   // Grand total adjusts for the shipping difference (computed vs. stored)
   const displayGrandTotal = Number(order.totalAmount) + (shippingFees - storedShippingFee);

   const handlePrint = () => {
      const printContent = document.getElementById('print-invoice-area')?.innerHTML;
      if (!printContent) return;

      const printWindow = window.open('', '_blank', 'width=900,height=800');
      if (!printWindow) {
         alert('Please allow popups to print the invoice.');
         return;
      }

      printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice - ${order.orderIdStr || order.id}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        color: #1e293b;
        background: white;
        padding: 28px 36px 20px;
        height: fit-content;
      }
      @page { size: A4 portrait; margin: 8mm; }
      @media print {
        html, body {
          margin: 0;
          padding: 0;
          background: white;
          height: auto;
        }
        .invoice-main-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 260mm;
          padding: 0.4cm 0.8cm;
          box-sizing: border-box;
          page-break-inside: avoid;
        }
      }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 6px 4px; text-align: left; }
      th { font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
      td { border-bottom: 1px solid #f1f5f9; }
      .text-right { text-align: right; }
      .font-bold { font-weight: 700; }
      .font-black { font-weight: 900; }
      .font-mono { font-family: ui-monospace, monospace; }
      .text-slate-400 { color: #94a3b8; }
      .text-slate-500 { color: #64748b; }
      .text-slate-600 { color: #475569; }
      .text-slate-700 { color: #334155; }
      .text-slate-800 { color: #1e293b; }
      .text-slate-900 { color: #0f172a; }
      .text-emerald-700 { color: #047857; }
      .text-emerald-900 { color: #064e3b; }
      .border-b { border-bottom: 1px solid #f1f5f9; }
      .border-t { border-top: 1px solid #f1f5f9; }
      .border-slate-100 { border-color: #f1f5f9; }
      .border-slate-200 { border-color: #e2e8f0; }
      .border-dashed { border-style: dashed; }
      .rounded-2xl { border-radius: 1rem; }
      .flex { display: flex; }
      .items-center { align-items: center; }
      .justify-between { justify-content: space-between; }
      .justify-center { justify-content: center; }
      .text-center { text-align: center; }
      .grid { display: grid; }
      .grid-cols-2 { grid-template-columns: 1fr 1fr; }
      .gap-8 { gap: 2rem; }
      .gap-2 { gap: 0.5rem; }
      .space-y-3 > * + * { margin-top: 0.75rem; }
      .space-y-2 > * + * { margin-top: 0.5rem; }
      .mb-2 { margin-bottom: 0.5rem; }
      .mb-4 { margin-bottom: 1rem; }
      .mb-6 { margin-bottom: 1.5rem; }
      .mb-8 { margin-bottom: 2rem; }
      .mt-4 { margin-top: 1rem; }
      .pb-4 { padding-bottom: 1rem; }
      .pt-4 { padding-top: 1rem; }
      .pt-2 { padding-top: 0.5rem; }
      .pt-3 { padding-top: 0.75rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
      .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
      .p-5 { padding: 1.25rem; }
      .leading-relaxed { line-height: 1.625; }
      .leading-none { line-height: 1; }
      .leading-normal { line-height: 1.5; }
      .text-xs { font-size: 0.75rem; }
      .text-sm { font-size: 0.875rem; }
      .text-base { font-size: 1rem; }
      .uppercase { text-transform: uppercase; }
      .tracking-tight { letter-spacing: -0.025em; }
      .tracking-wider { letter-spacing: 0.05em; }
      .tracking-widest { letter-spacing: 0.1em; }
      .block { display: block; }
      .shrink-0 { flex-shrink: 0; }
      .w-auto { width: auto; }
      .h-6 { height: 1.5rem; }
      .object-contain { object-fit: contain; }
      img { max-height: 24px; width: auto; }
    </style>
  </head>
  <body>
    ${printContent}
    <script>
      window.onload = function() { window.print(); };
    </script>
  </body>
</html>`);
      printWindow.document.close();
   };

   return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
         <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header Controls (Don't print) */}
            <div className="no-print p-6 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex justify-between items-center shrink-0">
               <div>
                  <h3 className="font-black text-lg tracking-tight">Invoice Receipt</h3>
                  <p className="text-xs text-emerald-200/80 font-medium">Order #{order.orderIdStr || order.id}</p>
               </div>
               <div className="flex items-center gap-3">
                  <button
                     onClick={handlePrint}
                     className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                     <Download size={14} /> Print / Save PDF
                  </button>
                  <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                     <X className="h-5 w-5" />
                  </button>
               </div>
            </div>

            {/* Invoice Body Area */}
            <div id="print-invoice-area" className="p-8 overflow-y-auto flex-1 bg-white text-slate-800 text-xs font-sans print:overflow-visible">
               <div className="invoice-main-content">
                  <div className="invoice-content-body">
                     {/* Main Top Header Block */}
                     <div className="text-center border-b border-slate-100 pb-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                           <img src="/logo.webp" alt="Namma Ooru Foods" style={{ height: '24px', width: 'auto', maxHeight: '24px', flexShrink: 0 }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                           <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none">Namma Ooru Foods</h1>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold leading-normal">
                           9, First Floor, Opp. Jayam Hospital Chokkikulam Madurai Tamil Nadu 625002<br />
                           Phone : 9000896898
                        </p>
                     </div>

                     {/* Metadata Block (Two Column layout matching reference) */}
                     <div className="grid grid-cols-2 gap-8 mb-6 pb-6 border-b border-slate-100">
                        {/* Left Column */}
                        <div className="space-y-3">
                           <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Order Number :</span>
                              <p className="font-extrabold text-slate-800 text-sm">{order.orderIdStr || `ORD-${order.id.toString().padStart(4, '0')}`}</p>
                           </div>
                           <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Bill Date :</span>
                              <p className="font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                           <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Customer Details :</span>
                              <p className="font-extrabold text-slate-800">{order.shippingAddress?.recipientName || order.shippingAddress?.name || order.user?.name || 'Customer'}</p>
                              <p className="font-bold text-slate-600">{order.shippingAddress?.phone || order.user?.phone || 'N/A'}</p>
                           </div>
                           <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Operator :</span>
                              <p className="font-bold text-slate-700">Namma Ooru Foods</p>
                           </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                           <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Delivery Area :</span>
                              <p className="font-bold text-slate-700">{order.shippingAddress?.state || 'Tamil Nadu'}</p>
                           </div>
                           <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Delivery Address :</span>
                              <p className="font-bold text-slate-700 leading-relaxed">
                                 {order.shippingAddress?.line1}
                                 {order.shippingAddress?.line2 && `, ${order.shippingAddress?.line2}`}
                                 {`, ${order.shippingAddress?.city} - ${order.shippingAddress?.pincode}`}
                              </p>
                           </div>
                           <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Expected Delivery Time :</span>
                              <p className="font-bold text-slate-700">
                                 {order.status === 'DELIVERED'
                                    ? `Delivered on ${new Date(order.deliveryDate || order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                    : `${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                              </p>
                           </div>
                           <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Payment Type :</span>
                              <p className="font-bold text-slate-700">{order.paymentMethod === 'Razorpay Online' ? 'Online Payment (Razorpay)' : order.paymentMethod || 'Online Payment'}</p>
                           </div>
                        </div>
                     </div>

                     {/* Items Table */}
                     <div className="mb-6">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="border-t border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                 <th className="py-2.5 w-8">No</th>
                                 <th className="py-2.5 w-20">Item Code</th>
                                 <th className="py-2.5">Item</th>
                                 <th className="py-2.5 w-14">Weight</th>
                                 <th className="py-2.5 text-right w-14">Qty</th>
                                 <th className="py-2.5 text-right w-14">MRP</th>
                                 <th className="py-2.5 text-right w-14">Rate</th>
                                 <th className="py-2.5 text-right w-16">Amt</th>
                              </tr>
                           </thead>
                           <tbody>
                              {items.map((item: any, idx: number) => {
                                 const rate = Number(item.price || item.unitPrice || 0);
                                 const mrp = Number(item.product?.price || rate);
                                 const variantDisplay = item.variant || item.variantName || item.product?.unit || '—';
                                 return (
                                    <tr key={idx} className="border-b border-slate-100 text-slate-700 font-medium">
                                       <td className="py-2.5">{idx + 1}</td>
                                       <td className="py-2.5 font-mono text-[10px]">{item.product?.productIdStr || item.product?.sku || `ITEM${String(item.productId || idx + 1).padStart(4, '0')}`}</td>
                                       <td className="py-2.5 font-bold text-slate-900">{item.product?.name || item.name}</td>
                                       <td className="py-2.5 text-[10px] text-slate-500 font-semibold">{variantDisplay}</td>
                                       <td className="py-2.5 text-right font-mono">{Number(item.quantity).toFixed(3)}</td>
                                       <td className="py-2.5 text-right font-mono">{mrp.toFixed(2)}</td>
                                       <td className="py-2.5 text-right font-mono">{rate.toFixed(2)}</td>
                                       <td className="py-2.5 text-right font-mono font-bold text-slate-900">{(rate * item.quantity).toFixed(2)}</td>
                                    </tr>
                                 );
                              })}
                              {/* Items Subtotal row */}
                              <tr className="border-b border-slate-100 font-semibold text-slate-600 text-[11px]">
                                 <td colSpan={4} className="py-2">Total Item(s): {items.length}</td>
                                 <td colSpan={3} className="py-2 text-right">Items Subtotal</td>
                                 <td className="py-2 text-right font-mono">₹{subtotal.toFixed(2)}</td>
                              </tr>
                              {/* Shipping Charges row */}
                              <tr className="border-b border-slate-100 font-semibold text-slate-600 text-[11px]">
                                 <td colSpan={4} className="py-2">Total Weight: {totalWeightKg.toFixed(3)} kg</td>
                                 <td colSpan={3} className="py-2 text-right">Shipping Charges</td>
                                 <td className="py-2 text-right font-mono">₹{shippingFees.toFixed(2)}</td>
                              </tr>
                              {/* GST row if any */}
                              {Number(order.gstAmount || 0) > 0 && (
                                 <tr className="border-b border-slate-100 font-semibold text-slate-600 text-[11px]">
                                    <td colSpan={4} className="py-2"></td>
                                    <td colSpan={3} className="py-2 text-right">GST Amount</td>
                                    <td className="py-2 text-right font-mono">₹{Number(order.gstAmount).toFixed(2)}</td>
                                 </tr>
                              )}
                              {/* Discount row if any */}
                              {Number(order.discountAmount || 0) > 0 && (
                                 <tr className="border-b border-slate-100 font-semibold text-slate-600 text-[11px]">
                                    <td colSpan={4} className="py-2"></td>
                                    <td colSpan={3} className="py-2 text-right">Discount</td>
                                    <td className="py-2 text-right font-mono">(-) ₹{Number(order.discountAmount).toFixed(2)}</td>
                                 </tr>
                              )}
                              {/* Grand Total row */}
                              <tr className="border-b border-slate-200 font-extrabold text-slate-900 text-sm">
                                 <td colSpan={4} className="py-3">
                                    <span className="text-[9px] font-semibold text-slate-400 italic">* All Tax Included</span>
                                 </td>
                                 <td colSpan={3} className="py-3 text-right">Grand Total (Incl. Taxes)</td>
                                 <td className="py-3 text-right font-mono">₹{displayGrandTotal.toFixed(2)}</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     {/* GST Details Breakdown table */}
                     {Number(order.gstAmount || 0) > 0 && (
                        <div className="mb-6">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">GST Details:</p>
                           <table className="w-full text-left border-collapse text-[11px]">
                              <thead>
                                 <tr className="border-t border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="py-2">GST%</th>
                                    <th className="py-2 text-right">Taxable</th>
                                    <th className="py-2 text-right">SGST</th>
                                    <th className="py-2 text-right">CGST</th>
                                    <th className="py-2 text-right">Total</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr className="border-b border-slate-100 text-slate-700 font-semibold">
                                    <td className="py-2 font-mono">5.00%</td>
                                    <td className="py-2 text-right font-mono">{subtotal.toFixed(2)}</td>
                                    <td className="py-2 text-right font-mono">{(Number(order.gstAmount || 0) / 2).toFixed(2)}</td>
                                    <td className="py-2 text-right font-mono">{(Number(order.gstAmount || 0) / 2).toFixed(2)}</td>
                                    <td className="py-2 text-right font-mono font-bold">{(subtotal + Number(order.gstAmount || 0)).toFixed(2)}</td>
                                 </tr>
                                 <tr className="font-extrabold text-slate-900 border-b border-slate-200">
                                    <td className="py-2">Total</td>
                                    <td className="py-2 text-right font-mono">{subtotal.toFixed(2)}</td>
                                    <td className="py-2 text-right font-mono">{(Number(order.gstAmount || 0) / 2).toFixed(2)}</td>
                                    <td className="py-2 text-right font-mono">{(Number(order.gstAmount || 0) / 2).toFixed(2)}</td>
                                    <td className="py-2 text-right font-mono font-bold">{(subtotal + Number(order.gstAmount || 0)).toFixed(2)}</td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                     )}

                     {/* Payment Summary Box */}
                      <div className="border border-dashed border-slate-300 rounded-xl p-3 mb-3">
                         <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Summary :</h4>
                         <div className="space-y-1">
                            <div className="flex justify-between items-center font-bold text-slate-700 text-[11px]">
                               <span>{order.paymentMethod === 'Razorpay Online' ? 'Online Payment (Razorpay)' : order.paymentMethod || 'Online Payment'}</span>
                               <span className="font-mono">(-) ₹{displayGrandTotal.toFixed(2)}</span>
                            </div>
                         </div>
                         {Number(order.discountAmount || 0) > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-100 text-center text-emerald-700 font-extrabold text-[11px]">
                               You saved ₹{Number(order.discountAmount).toFixed(2)} !
                            </div>
                         )}
                      </div>

                  </div>

                  {/* Footer Thank You */}
                  <div className="text-center pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold leading-normal">
                     Thank You! Shop Again<br />
                     9000896898
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
}

interface TrackingInfo {
   id: number;
   orderId: number;
   carrierName?: string;
   trackingNumber?: string;
   trackingUrl?: string;
   estimatedDelivery?: string;
   updatedAt: string;
   order: { status: string; invoiceNumber?: string; createdAt: string };
}

export default function OrdersPage() {
   const { user } = useAuth();
   const { data: settingsData } = useSWR(`${API_URL}/api/settings`, url => fetch(url).then(r => r.json()));
   const getSettingVal = (key: string, fallback: string) => {
      if (!settingsData || !Array.isArray(settingsData)) return fallback;
      const found = settingsData.find((s: any) => s.key === key);
      return found ? found.value : fallback;
   };
   const gstTaxLabel = getSettingVal('gst_tax_label', 'GST');
   const [orders, setOrders] = useState<any[]>([]);
   const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
   const [tracking, setTracking] = useState<TrackingInfo | null>(null);
   const [loading, setLoading] = useState(true);
   const [trackLoading, setTrackLoading] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [activeInvoice, setActiveInvoice] = useState<any>(null);
   const [currentPage, setCurrentPage] = useState(1);
   const ITEMS_PER_PAGE = 5;

   useEffect(() => {
      setCurrentPage(1);
   }, [searchQuery]);

   useEffect(() => {
      if (!user?.id) {
         setLoading(false);
         return;
      }
      fetch(`${API_URL}/api/orders/user/${user.id}`)
         .then(r => r.json())
         .then(data => {
            setOrders(Array.isArray(data) ? data : []);
         })
         .catch(console.error)
         .finally(() => setLoading(false));
   }, [user]);

   useEffect(() => {
      if (!selectedOrderId) { setTracking(null); return; }
      setTrackLoading(true);
      fetch(`${API_URL}/api/tracking/${selectedOrderId}`)
         .then(r => r.json())
         .then(data => setTracking(data.error ? null : data))
         .catch(() => setTracking(null))
         .finally(() => setTrackLoading(false));
   }, [selectedOrderId]);

   useEffect(() => {
      if (orders.length > 0 && !selectedOrderId) {
         setSelectedOrderId(orders[0].id);
      }
   }, [orders, selectedOrderId]);

   const getStatusConfig = (status: string) => {
      switch (status?.toUpperCase()) {
         case 'DELIVERED':
            return {
               step: 4,
               progressPercent: 100,
               progressColor: 'bg-emerald-500',
               badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
               label: 'Delivered',
               etaText: 'Delivered successfully'
            };
         case 'OUT FOR DELIVERY':
            return {
               step: 3,
               progressPercent: 75,
               progressColor: 'bg-blue-500',
               badgeColor: 'text-blue-700 bg-blue-50 border-blue-100',
               label: 'Out For Delivery',
               etaText: 'Arriving today'
            };
         case 'SHIPPED':
         case 'IN TRANSIT':
            return {
               step: 2,
               progressPercent: 50,
               progressColor: 'bg-blue-500',
               badgeColor: 'text-blue-700 bg-blue-50 border-blue-100',
               label: 'In Transit',
               etaText: 'Arriving in 2-3 working days'
            };
         case 'PROCESSING':
         case 'PACKED':
            return {
               step: 1,
               progressPercent: 25,
               progressColor: 'bg-orange-500',
               badgeColor: 'text-orange-700 bg-orange-50 border-orange-100',
               label: 'Packing',
               etaText: 'Preparing to dispatch'
            };
         case 'CONFIRMED':
            return {
               step: 0,
               progressPercent: 10,
               progressColor: 'bg-emerald-500',
               badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
               label: 'Confirmed',
               etaText: 'Order verified'
            };
         case 'CANCELLED':
            return {
               step: -1,
               progressPercent: 100,
               progressColor: 'bg-red-500',
               badgeColor: 'text-red-700 bg-red-50 border-red-100',
               label: 'Cancelled',
               etaText: 'Order was cancelled'
            };
         case 'RETURNED':
            return {
               step: -1,
               progressPercent: 100,
               progressColor: 'bg-purple-500',
               badgeColor: 'text-purple-700 bg-purple-50 border-purple-100',
               label: 'Returned',
               etaText: 'Order was returned'
            };
         case 'PENDING':
         default:
            return {
               step: 0,
               progressPercent: 0,
               progressColor: 'bg-slate-300',
               badgeColor: 'text-slate-500 bg-slate-50 border-slate-100',
               label: 'Awaiting Payment',
               etaText: 'Awaiting payment confirmation'
            };
      }
   };

   const getStepLabels = () => [
      { label: 'Confirmed', desc: 'Order placed' },
      { label: 'Packed', desc: 'Items prepared' },
      { label: 'Shipped', desc: 'Handed to courier' },
      { label: 'Out For Delivery', desc: 'Reaching soon' },
      { label: 'Delivered', desc: 'Finished' }
   ];



   const filteredOrders = orders
      .filter(order => {
         const idMatches = order.id.toString().includes(searchQuery);
         const itemsText = (order.orderItems || order.items || []).map((i: any) => i.product?.name || i.name || '').join(' ').toLowerCase();
         const queryMatches = itemsText.includes(searchQuery.toLowerCase());
         return idMatches || queryMatches;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

   const selectedOrder = orders.find(o => o.id === selectedOrderId);
   const selectedConfig = selectedOrder ? getStatusConfig(selectedOrder.status) : null;
   const stepLabels = getStepLabels();

   const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
   const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

   if (loading) {
      return (
         <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4 bg-[#f8fcf9]">
            <Loader2 className="animate-spin text-[#059669] h-10 w-10" />
            <p className="text-slate-500 font-medium text-sm animate-pulse">Loading logistics dashboard...</p>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#f8fcf9] py-8">
         {activeInvoice && <InvoiceModal order={activeInvoice} onClose={() => setActiveInvoice(null)} gstTaxLabel={gstTaxLabel} />}

         <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8">

            {/* Mobile Back Button */}
            <Link href="/account" className="md:hidden flex items-center gap-2 text-xs font-bold text-[#059669] mb-6 w-fit bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
               <ChevronLeft className="h-4 w-4" /> Back to Account
            </Link>

            {/* Dashboard Title & Top Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
               <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                     <Truck className="h-8 w-8 text-[#059669]" /> Order Tracking
                  </h1>
                  <p className="text-sm text-slate-500 font-medium mt-1">Real-time status updates and estimated delivery schedules.</p>
               </div>
               <div className="flex items-center gap-3">
                  {/* Additional actions can go here */}
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">

               {/* =======================
              LEFT COLUMN: Order List
          ======================= */}
               <div className="lg:col-span-1 flex flex-col gap-4">
                  {/* Search */}
                  <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <input
                        type="text"
                        placeholder="Search order ID..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                     />
                  </div>

                  {/* Order List */}
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                     <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 text-sm">Your Orders</h3>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filteredOrders.length}</span>
                     </div>

                     <div className="flex flex-col max-h-[650px] overflow-y-auto no-scrollbar">
                        {paginatedOrders.map(order => {
                           const config = getStatusConfig(order.status);
                           const isSelected = selectedOrderId === order.id;

                           return (
                              <button
                                 key={order.id}
                                 onClick={() => setSelectedOrderId(order.id)}
                                 className={`text-left p-5 border-b border-slate-100 transition-all duration-200 relative ${isSelected ? 'bg-emerald-50/40' : 'bg-white hover:bg-slate-50'}`}
                              >
                                 {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#059669]" />}
                                 <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                       <Package size={14} /> #{order.orderIdStr || `ORD-${order.id.toString().padStart(4, '0')}`}
                                    </p>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${config.badgeColor}`}>
                                       {config.label}
                                    </span>
                                 </div>
                                 <p className="font-black text-slate-900 text-base mb-1">₹{Number(order.totalAmount).toLocaleString()}</p>
                                 <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                    <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                 </p>
                              </button>
                           );
                        })}

                        {filteredOrders.length === 0 && (
                           <div className="p-8 text-center">
                              <Package className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                              <p className="text-sm font-bold text-slate-400">No active shipments found</p>
                           </div>
                        )}
                     </div>

                     {totalPages > 1 && (
                        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                           <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                           >
                              Previous
                           </button>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page {currentPage} of {totalPages}</span>
                           <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                           >
                              Next
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               {/* =======================
              RIGHT COLUMN: Dashboard
          ======================= */}
               <div className="lg:col-span-3 flex flex-col gap-6">
                  {selectedOrder && selectedConfig ? (
                     <>
                        {/* Top: Order Header */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                           <div className="flex gap-4 items-center">
                              <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 p-1">
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Order</span>
                                 <span className="text-[12px] font-black text-[#059669] tracking-tight leading-none text-center">
                                    {selectedOrder.orderIdStr || `ORD-${selectedOrder.id.toString().padStart(4, '0')}`}
                                 </span>
                              </div>
                              <div>
                                 <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedConfig.label}</h2>
                                 <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                 </p>
                              </div>
                           </div>

                           <div className="flex gap-4 lg:gap-8 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                              <div>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
                                 <p className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-100 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Paid Online
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Middle: Live Tracking Timeline */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
                           <div className="flex items-center justify-between mb-8">
                              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                 <Truck className="h-5 w-5 text-[#059669]" /> Live Tracking Progress
                              </h3>
                              <div className="bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5 flex items-center gap-2">
                                 {selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'RETURNED' ? (
                                    <span className="text-xs font-black text-red-600">Order Stopped</span>
                                 ) : (
                                    <span className="text-xs font-black text-[#059669]">{selectedConfig.progressPercent}% Complete</span>
                                 )}
                              </div>
                           </div>

                           {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'RETURNED' ? (
                              <div className="relative pt-6 pb-2 px-4 sm:px-8">
                                 {/* Progress Line Base */}
                                 <div className="absolute top-[38px] left-8 right-8 h-1.5 bg-slate-100 rounded-full" />
                                 {/* Progress Line Fill */}
                                 <div
                                    className={`absolute top-[38px] left-8 h-1.5 rounded-full transition-all duration-1000 ${selectedConfig.progressColor}`}
                                    style={{ width: `calc(${selectedConfig.progressPercent}% - 2rem)` }}
                                 />

                                 {/* Step Nodes */}
                                 <div className="relative flex justify-between items-start">
                                    {stepLabels.map((step, idx) => {
                                       const isCompleted = selectedConfig.step > idx;
                                       const isCurrent = selectedConfig.step === idx;
                                       const isPending = selectedConfig.step < idx;

                                       return (
                                          <div key={idx} className="flex flex-col items-center text-center w-20 relative z-10">
                                             <div
                                                className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 shadow-sm bg-white
                                          ${isCompleted ? 'border-emerald-500 text-emerald-500' : isCurrent ? 'border-blue-500 text-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]' : 'border-slate-200 text-slate-300'}`}
                                             >
                                                {isCompleted ? <Check className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3]" /> : <Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
                                             </div>
                                             <p className={`text-[10px] sm:text-xs font-black uppercase tracking-wider mt-3 ${isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>
                                                {step.label}
                                             </p>
                                             <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 mt-0.5 hidden sm:block">
                                                {step.desc}
                                             </p>
                                          </div>
                                       );
                                    })}
                                 </div>
                              </div>
                           ) : (
                              <div className="py-8 text-center bg-red-50 rounded-2xl border border-red-100">
                                 <p className="text-red-600 font-bold">This order has been {selectedOrder.status.toLowerCase()}.</p>
                              </div>
                           )}

                           {/* Shipment Information Sub-box */}
                           <div className="mt-10 bg-slate-50 border border-slate-100 rounded-2xl p-6">
                              <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                                 <Truck className="h-4 w-4 text-[#059669]" /> Shipment Information
                              </h4>

                              {selectedConfig.step < 2 ? (
                                 <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                                    <p className="text-sm font-bold text-slate-500">Shipment details will be available once the order is dispatched.</p>
                                 </div>
                              ) : trackLoading ? (
                                 <div className="bg-white rounded-xl p-6 border border-slate-200 flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                                 </div>
                              ) : tracking && (tracking.carrierName || tracking.trackingNumber) ? (
                                 <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-wrap gap-6 items-center justify-between">
                                    <div className="flex gap-8 flex-wrap">
                                       {tracking.carrierName && (
                                          <div>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Courier Partner</p>
                                             <p className="text-sm font-black text-slate-900">{tracking.carrierName}</p>
                                          </div>
                                       )}
                                       {tracking.trackingNumber && (
                                          <div>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AWB Number</p>
                                             <div className="flex items-center gap-2">
                                                <p className="text-sm font-mono font-black text-[#059669]">{tracking.trackingNumber}</p>
                                                <button
                                                   onClick={() => {
                                                      navigator.clipboard.writeText(tracking.trackingNumber!);
                                                   }}
                                                   className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#059669] bg-slate-100 hover:bg-emerald-50 px-2 py-0.5 rounded transition-colors"
                                                >
                                                   Copy
                                                </button>
                                             </div>
                                          </div>
                                       )}
                                       {tracking.updatedAt && (
                                          <div>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dispatch Date</p>
                                             <p className="text-sm font-medium text-slate-900">
                                                {new Date(tracking.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                             </p>
                                          </div>
                                       )}
                                    </div>
                                    {tracking.trackingUrl && (
                                       <a
                                          href={tracking.trackingUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="h-10 px-4 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                                       >
                                          Track Shipment <ExternalLinkIcon className="h-3 w-3" />
                                       </a>
                                    )}
                                 </div>
                              ) : (
                                 <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                                    <p className="text-sm font-medium text-slate-500">Tracking information has not been synchronized yet.</p>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Bottom: Split Cards (Products & Details) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

                           {/* Products Card */}
                           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col">
                              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                                 <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4 text-[#059669]" /> Order Items
                                 </h3>
                                 {selectedOrder.status === 'DELIVERED' && (
                                    <button
                                       onClick={() => setActiveInvoice(selectedOrder)}
                                       className="text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                                    >
                                       <Download size={14} /> Invoice
                                    </button>
                                 )}
                              </div>

                              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
                                 {(selectedOrder.orderItems || selectedOrder.items || []).map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4">
                                       <div className="h-14 w-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                                          {(item.product?.image || item.product?.images?.[0]) ? (
                                             <img src={item.product?.image || item.product?.images?.[0]} alt="" className="h-full w-full object-cover" />
                                          ) : (
                                             <Package className="h-6 w-6 text-slate-300" />
                                          )}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <p className="text-sm font-bold text-slate-900 truncate">{item.product?.name || item.name}</p>
                                          <p className="text-xs font-medium text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                                       </div>
                                       <div className="text-right shrink-0">
                                          <p className="text-sm font-black text-slate-900">₹{Number(item.price || item.unitPrice || 0) * item.quantity}</p>
                                       </div>
                                    </div>
                                 ))}
                              </div>

                              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3">
                                 <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                    <span>Subtotal</span>
                                    <span>₹{selectedOrder.totalAmount - (selectedOrder.gstAmount || 0) - (selectedOrder.deliveryFee || 0) + (selectedOrder.discountAmount || 0)}</span>
                                 </div>

                                 {Number(selectedOrder.gstAmount || 0) > 0 && (
                                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                       <span>{gstTaxLabel}</span>
                                       <span>₹{selectedOrder.gstAmount}</span>
                                    </div>
                                 )}

                                 {Number(selectedOrder.deliveryFee || 0) > 0 && (
                                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                       <span>Delivery Fee</span>
                                       <span>₹{selectedOrder.deliveryFee}</span>
                                    </div>
                                 )}

                                 {Number(selectedOrder.discountAmount || 0) > 0 && (
                                    <div className="flex justify-between items-center text-sm font-bold text-emerald-600">
                                       <span>Discount</span>
                                       <span>-₹{selectedOrder.discountAmount}</span>
                                    </div>
                                 )}

                                 <div className="flex justify-between items-center pt-4 mt-2 border-t border-dashed border-slate-200">
                                    <span className="text-base font-bold text-slate-900">Grand Total</span>
                                    <span className="text-xl font-black text-slate-900">₹{selectedOrder.totalAmount}</span>
                                 </div>
                              </div>
                           </div>

                           {/* Delivery Info Card */}
                           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col">
                              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
                                 <MapPin className="h-4 w-4 text-[#059669]" /> Delivery Information
                              </h3>

                              {selectedOrder.shippingAddress ? (
                                 <div className="flex flex-col gap-6">
                                    <div>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Recipient</p>
                                       <p className="text-sm font-bold text-slate-900">{selectedOrder.shippingAddress.recipientName || selectedOrder.shippingAddress.name || 'Customer'}</p>
                                       <p className="text-sm font-medium text-slate-600 mt-1">{selectedOrder.shippingAddress.phone}</p>
                                    </div>
                                    <div>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Shipping Address</p>
                                       <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                          {selectedOrder.shippingAddress.line1}
                                          {selectedOrder.shippingAddress.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ''}
                                          <br />
                                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                                       </p>
                                    </div>
                                 </div>
                              ) : (
                                 <div className="flex-1 flex items-center justify-center">
                                    <p className="text-sm font-bold text-slate-400">Address details not available.</p>
                                 </div>
                              )}


                           </div>

                        </div>
                     </>
                  ) : (
                     <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center min-h-[500px]">
                        <Truck className="h-16 w-16 text-slate-200 mb-4" />
                        <h3 className="text-xl font-black text-slate-900 mb-2">No Order Selected</h3>
                        <p className="text-sm font-medium text-slate-500">Select an order from the list to view its tracking details.</p>
                     </div>
                  )}
               </div>

            </div>
         </div>
      </div>
   );
}
