'use client';

import React from 'react';
import {
   Settings,
   MapPin,
   CreditCard,
   Bell,
   ShieldCheck,
   Clock,
   Store,
   ChevronRight,
   Save
} from 'lucide-react';

import { API_URL } from '@/lib/api';

export default function AdminSettings() {
   const [activeTab, setActiveTab] = React.useState(0);
   const [loading, setLoading] = React.useState(true);

   // Store Profile States
   const [storeName, setStoreName] = React.useState('namma ooru Foods Ltd');
   const [storeCategory, setStoreCategory] = React.useState('Organic Essentials');
   const [supportEmail, setSupportEmail] = React.useState('care@nammaooru.com');
   const [supportWhatsapp, setSupportWhatsapp] = React.useState('+91 98765 43210');

   // Logistics States
   const [deliveryRadius, setDeliveryRadius] = React.useState(15);
   const [deliveryFee, setDeliveryFee] = React.useState(40);
   const [freeShippingThreshold, setFreeShippingThreshold] = React.useState(1000);

   // Payment States
   const [enableCod, setEnableCod] = React.useState(true);
   const [razorpayKey, setRazorpayKey] = React.useState('');
   const [gstNumber, setGstNumber] = React.useState('');
   const [hdfcMerchantId, setHdfcMerchantId] = React.useState('SG5067');
   const [hdfcClientId, setHdfcClientId] = React.useState('hdfcmaster');
   const [hdfcApiKey, setHdfcApiKey] = React.useState('EBBF2342D13404C9ACD436E5A437C4');
   const [hdfcApiUrl, setHdfcApiUrl] = React.useState('https://smartgateway.hdfcuat.bank.in/session');

   // Notification States
   const [orderEmail, setOrderEmail] = React.useState('orders@nammaooru.com');
   const [enableWhatsappAlerts, setEnableWhatsappAlerts] = React.useState(true);
   const [lowStockThreshold, setLowStockThreshold] = React.useState(5);

   // Vendor Payouts States
   const [slabs, setSlabs] = React.useState([
      { min: 0, max: 12500, percentage: 30 },
      { min: 12500, max: 25000, percentage: 20 },
      { min: 25000, max: 125000, percentage: 10 },
      { min: 125000, max: null, percentage: 5 }
   ]);
   const [settlementDay, setSettlementDay] = React.useState('Monday');
   const [minPayout, setMinPayout] = React.useState(2000);

   React.useEffect(() => {
      const fetchSettings = async () => {
         try {
            const response = await fetch(`${API_URL}/api/settings`);
            if (response.ok) {
               const data = await response.json();
               const slabsSetting = data.find((s: any) => s.key === 'vendor_commission_slabs');
               const daySetting = data.find((s: any) => s.key === 'settlement_day');
               const payoutSetting = data.find((s: any) => s.key === 'min_payout_value');

               // Store Profile
               const nameSetting = data.find((s: any) => s.key === 'store_name');
               const catSetting = data.find((s: any) => s.key === 'store_category');
               const emailSetting = data.find((s: any) => s.key === 'support_email');
               const whatsappSetting = data.find((s: any) => s.key === 'support_whatsapp');

               // Logistics
               const radiusSetting = data.find((s: any) => s.key === 'delivery_radius');
               const feeSetting = data.find((s: any) => s.key === 'delivery_fee');
               const thresholdSetting = data.find((s: any) => s.key === 'free_shipping_threshold');

               // Payments
               const codSetting = data.find((s: any) => s.key === 'enable_cod');
               const razorpaySetting = data.find((s: any) => s.key === 'razorpay_key');
               const gstSetting = data.find((s: any) => s.key === 'gst_number');
               const hdfcMerchantSetting = data.find((s: any) => s.key === 'hdfc_merchant_id');
               const hdfcClientSetting = data.find((s: any) => s.key === 'hdfc_client_id');
               const hdfcApiSetting = data.find((s: any) => s.key === 'hdfc_api_key');
               const hdfcUrlSetting = data.find((s: any) => s.key === 'hdfc_api_url');

               // Notifications
               const orderEmailSetting = data.find((s: any) => s.key === 'notification_order_email');
               const whatsappAlertSetting = data.find((s: any) => s.key === 'enable_whatsapp_alerts');
               const stockSetting = data.find((s: any) => s.key === 'low_stock_threshold');

               if (slabsSetting) setSlabs(JSON.parse(slabsSetting.value));
               if (daySetting) setSettlementDay(daySetting.value);
               if (payoutSetting) setMinPayout(Number(payoutSetting.value));

               if (nameSetting) setStoreName(nameSetting.value);
               if (catSetting) setStoreCategory(catSetting.value);
               if (emailSetting) setSupportEmail(emailSetting.value);
               if (whatsappSetting) setSupportWhatsapp(whatsappSetting.value);

               if (radiusSetting) setDeliveryRadius(Number(radiusSetting.value));
               if (feeSetting) setDeliveryFee(Number(feeSetting.value));
               if (thresholdSetting) setFreeShippingThreshold(Number(thresholdSetting.value));

               if (codSetting) setEnableCod(codSetting.value === 'true');
               if (razorpaySetting) setRazorpayKey(razorpaySetting.value);
               if (gstSetting) setGstNumber(gstSetting.value);
               if (hdfcMerchantSetting) setHdfcMerchantId(hdfcMerchantSetting.value);
               if (hdfcClientSetting) setHdfcClientId(hdfcClientSetting.value);
               if (hdfcApiSetting) setHdfcApiKey(hdfcApiSetting.value);
               if (hdfcUrlSetting) setHdfcApiUrl(hdfcUrlSetting.value);

               if (orderEmailSetting) setOrderEmail(orderEmailSetting.value);
               if (whatsappAlertSetting) setEnableWhatsappAlerts(whatsappAlertSetting.value === 'true');
               if (stockSetting) setLowStockThreshold(Number(stockSetting.value));
            }
         } catch (error) {
            console.error('Error fetching settings:', error);
         } finally {
            setLoading(false);
         }
      };
      fetchSettings();
   }, []);

   const handleSave = async () => {
      try {
         const settingsToUpdate = [
            { key: 'vendor_commission_slabs', value: JSON.stringify(slabs), type: 'JSON', group: 'VENDOR' },
            { key: 'settlement_day', value: settlementDay, type: 'STRING', group: 'VENDOR' },
            { key: 'min_payout_value', value: minPayout.toString(), type: 'NUMBER', group: 'VENDOR' },

            { key: 'store_name', value: storeName, type: 'STRING', group: 'STORE' },
            { key: 'store_category', value: storeCategory, type: 'STRING', group: 'STORE' },
            { key: 'support_email', value: supportEmail, type: 'STRING', group: 'STORE' },
            { key: 'support_whatsapp', value: supportWhatsapp, type: 'STRING', group: 'STORE' },

            { key: 'delivery_radius', value: deliveryRadius.toString(), type: 'NUMBER', group: 'LOGISTICS' },
            { key: 'delivery_fee', value: deliveryFee.toString(), type: 'NUMBER', group: 'LOGISTICS' },
            { key: 'free_shipping_threshold', value: freeShippingThreshold.toString(), type: 'NUMBER', group: 'LOGISTICS' },

            { key: 'enable_cod', value: enableCod.toString(), type: 'BOOLEAN', group: 'PAYMENT' },
            { key: 'razorpay_key', value: razorpayKey, type: 'STRING', group: 'PAYMENT' },
            { key: 'gst_number', value: gstNumber, type: 'STRING', group: 'PAYMENT' },
            { key: 'hdfc_merchant_id', value: hdfcMerchantId, type: 'STRING', group: 'PAYMENT' },
            { key: 'hdfc_client_id', value: hdfcClientId, type: 'STRING', group: 'PAYMENT' },
            { key: 'hdfc_api_key', value: hdfcApiKey, type: 'STRING', group: 'PAYMENT' },
            { key: 'hdfc_api_url', value: hdfcApiUrl, type: 'STRING', group: 'PAYMENT' },

            { key: 'notification_order_email', value: orderEmail, type: 'STRING', group: 'NOTIF' },
            { key: 'enable_whatsapp_alerts', value: enableWhatsappAlerts.toString(), type: 'BOOLEAN', group: 'NOTIF' },
            { key: 'low_stock_threshold', value: lowStockThreshold.toString(), type: 'NUMBER', group: 'NOTIF' }
         ];

         const response = await fetch(`${API_URL}/api/settings/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings: settingsToUpdate })
         });

         if (response.ok) {
            alert('Settings saved successfully!');
         } else {
            alert('Failed to save settings.');
         }
      } catch (error) {
         console.error('Error saving settings:', error);
         alert('Error saving settings.');
      }
   };

   const sections = [
      {
         title: 'Brand and Contact Details',
         desc: 'Brand and Contact Details',
         icon: Store,
         fields: ['Legal Name', 'Business Category', 'Support Email', 'Support WhatsApp']
      },
      {
         title: 'Logistics & Shipping',
         desc: 'Coverage area and delivery fee structure.',
         icon: MapPin,
         fields: ['Delivery Radius', 'Flat Rate Fee', 'Free Shipping Threshold']
      },
      {
         title: 'Payment Gateway',
         desc: 'Configure COD and third-party processors.',
         icon: CreditCard,
         fields: ['Enable COD', 'Razorpay Integration', 'Tax (GST) Settings']
      },
      {
         title: 'Notifications',
         desc: 'Transactional alerts and marketing triggers.',
         icon: Bell,
         fields: ['Order Placing Email', 'WhatsApp fulfillment alerts']
      },
      {
         title: 'Vendor Payouts',
         desc: 'Commission slabs and settlement cycles.',
         icon: ShieldCheck,
         fields: ['Commission Slabs', 'Settlement Day', 'Minimum Payout']
      }
   ];

   return (
      <div className="w-full space-y-10">

         {/* Header */}
         <div className="space-y-1">
            <h2 className="text-3xl font-black text-[#022c22] tracking-tighter uppercase">Admin Global Settings</h2>
            <p className="text-slate-400 font-medium text-sm">Fine-tune namma ooru's operational parameters.</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Navigation Sidebar-like Tabs */}
            <div className="lg:col-span-1 space-y-2">
               {sections.map((s, i) => (
                  <button
                     key={i}
                     onClick={() => setActiveTab(i)}
                     className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all group ${activeTab === i ? 'bg-[#022c22] text-white shadow-xl' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                  >
                     <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${activeTab === i ? 'bg-amber-400 text-[#022c22]' : 'bg-slate-50 text-slate-400 group-hover:text-amber-500 transition-all'}`}>
                        <s.icon size={20} />
                     </div>
                     <div className="flex flex-col text-left">
                        <span className="text-[12px] font-black uppercase tracking-widest">{s.title}</span>
                        <span className={`text-[10px] font-medium leading-none mt-1 ${activeTab === i ? 'text-emerald-400' : 'text-slate-300'}`}>Edit Configuration</span>
                     </div>
                     <ChevronRight size={16} className="ml-auto opacity-20" />
                  </button>
               ))}
            </div>

            {/* Form Content Area */}
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 overflow-hidden relative">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10 space-y-6">
                     <div className="pb-4 border-b border-slate-50">
                        <h3 className="text-xl font-black text-[#022c22] tracking-tighter uppercase">{sections[activeTab].title} Configuration</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">{sections[activeTab].desc}</p>
                     </div>

                     {activeTab === 0 && (
                        <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Legal Brand Name</label>
                                 <input
                                    type="text"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                                 />
                              </div>
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Store Category</label>
                                 <input
                                    type="text"
                                    value={storeCategory}
                                    onChange={(e) => setStoreCategory(e.target.value)}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                                 />
                              </div>
                           </div>

                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Official Support Email</label>
                              <input
                                 type="email"
                                 value={supportEmail}
                                 onChange={(e) => setSupportEmail(e.target.value)}
                                 className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                              />
                           </div>

                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">WhatsApp Hotline Number</label>
                              <input
                                 type="text"
                                 value={supportWhatsapp}
                                 onChange={(e) => setSupportWhatsapp(e.target.value)}
                                 className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                              />
                           </div>
                        </div>
                     )}

                     {activeTab === 1 && (
                        <div className="space-y-6">
                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Maximum Delivery Radius (km)</label>
                              <input
                                 type="number"
                                 value={deliveryRadius}
                                 onChange={(e) => setDeliveryRadius(Number(e.target.value))}
                                 className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                              />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Flat Delivery Fee (₹)</label>
                                 <input
                                    type="number"
                                    value={deliveryFee}
                                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                                 />
                              </div>
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Free Delivery Above (₹)</label>
                                 <input
                                    type="number"
                                    value={freeShippingThreshold}
                                    onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 2 && (
                        <div className="space-y-6">
                           {/* HDFC SmartGateway Integration */}
                           <div className="p-6 border border-slate-100 rounded-3xl bg-[#022c22]/[0.02] space-y-5">
                              <h4 className="text-xs font-black uppercase tracking-wider text-[#022c22] border-l-2 border-amber-400 pl-3">HDFC SmartGateway Configuration</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                 <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HDFC Merchant ID</label>
                                    <input
                                       type="text"
                                       value={hdfcMerchantId}
                                       onChange={(e) => setHdfcMerchantId(e.target.value)}
                                       className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-[#022c22] focus:border-emerald-500 transition-all text-sm"
                                    />
                                 </div>
                                 <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HDFC Client ID</label>
                                    <input
                                       type="text"
                                       value={hdfcClientId}
                                       onChange={(e) => setHdfcClientId(e.target.value)}
                                       className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-[#022c22] focus:border-emerald-500 transition-all text-sm"
                                    />
                                 </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HDFC API Key</label>
                                 <input
                                    type="password"
                                    value={hdfcApiKey}
                                    onChange={(e) => setHdfcApiKey(e.target.value)}
                                    placeholder="EBBF2342..."
                                    className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-[#022c22] focus:border-emerald-500 transition-all text-sm"
                                 />
                              </div>
                              <div className="flex flex-col gap-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HDFC API Session URL</label>
                                 <input
                                    type="text"
                                    value={hdfcApiUrl}
                                    onChange={(e) => setHdfcApiUrl(e.target.value)}
                                    className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-[#022c22] focus:border-emerald-500 transition-all text-sm"
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 3 && (
                        <div className="space-y-6">
                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Primary Order Notification Email</label>
                              <input
                                 type="email"
                                 value={orderEmail}
                                 onChange={(e) => setOrderEmail(e.target.value)}
                                 className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                              />
                           </div>
                           <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl">
                              <div className="flex-1">
                                 <h4 className="text-sm font-bold text-slate-900">WhatsApp Fulfillment Alerts</h4>
                                 <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Send automatic updates to customers on WhatsApp.</p>
                              </div>
                              <button
                                 onClick={() => setEnableWhatsappAlerts(!enableWhatsappAlerts)}
                                 className={`h-7 w-12 rounded-full transition-all relative ${enableWhatsappAlerts ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              >
                                 <div className={`h-5 w-5 rounded-full bg-white absolute top-1 transition-all ${enableWhatsappAlerts ? 'right-1' : 'left-1'}`} />
                              </button>
                           </div>
                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Low Stock Alert Threshold</label>
                              <input
                                 type="number"
                                 value={lowStockThreshold}
                                 onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                                 className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                              />
                           </div>
                        </div>
                     )}

                     {activeTab === 4 && (
                        <div className="space-y-6">
                           <div className="flex flex-col gap-2">
                              <h4 className="text-[11px] font-black uppercase tracking-[.3em] text-slate-400 mb-2">Weekly Vendor Settlement Slabs</h4>
                              <div className="space-y-4">
                                 {slabs.map((slab, i) => (
                                    <div key={i} className="grid grid-cols-3 gap-4 items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                       <div className="flex flex-col gap-2">
                                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Min Amount (₹)</label>
                                          <input
                                             type="number"
                                             value={slab.min}
                                             onChange={(e) => {
                                                const newSlabs = [...slabs];
                                                newSlabs[i].min = Number(e.target.value);
                                                setSlabs(newSlabs);
                                             }}
                                             className="h-10 px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-[#022c22]"
                                          />
                                       </div>
                                       <div className="flex flex-col gap-2">
                                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Max Amount (₹)</label>
                                          <input
                                             type="text"
                                             value={slab.max === null ? 'No Limit' : slab.max}
                                             onChange={(e) => {
                                                const newSlabs = [...slabs];
                                                newSlabs[i].max = e.target.value === 'No Limit' ? null : Number(e.target.value);
                                                setSlabs(newSlabs);
                                             }}
                                             className="h-10 px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-[#022c22]"
                                          />
                                       </div>
                                       <div className="flex flex-col gap-2">
                                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Commission (%)</label>
                                          <div className="relative">
                                             <input
                                                type="number"
                                                value={slab.percentage}
                                                onChange={(e) => {
                                                   const newSlabs = [...slabs];
                                                   newSlabs[i].percentage = Number(e.target.value);
                                                   setSlabs(newSlabs);
                                                }}
                                                className="h-10 w-full px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-[#022c22]"
                                             />
                                             <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-300">%</span>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Weekly Settlement Day</label>
                                 <select
                                    value={settlementDay}
                                    onChange={(e) => setSettlementDay(e.target.value)}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20"
                                 >
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                    <option value="Saturday">Saturday</option>
                                    <option value="Sunday">Sunday</option>
                                 </select>
                              </div>
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Minimum Payout Value</label>
                                 <input
                                    type="number"
                                    value={minPayout}
                                    onChange={(e) => setMinPayout(Number(e.target.value))}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20"
                                 />
                              </div>
                           </div>
                        </div>
                     )}



                     <div className="pt-8 flex justify-end gap-4">
                        <button
                           onClick={handleSave}
                           className="h-14 px-10 rounded-2xl bg-[#022c22] text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/10 active:scale-95 transition-all"
                        >
                           <Save size={18} />
                           Save Changes
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
