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

          if (slabsSetting) setSlabs(JSON.parse(slabsSetting.value));
          if (daySetting) setSettlementDay(daySetting.value);
          if (payoutSetting) setMinPayout(Number(payoutSetting.value));
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
        { key: 'min_payout_value', value: minPayout.toString(), type: 'NUMBER', group: 'VENDOR' }
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
      title: 'Store Profile', 
      desc: 'Local harvest brand and contact details.',
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
    <div className="max-w-5xl space-y-10">
      
      {/* Header */}
      <div className="space-y-1">
         <h2 className="text-3xl font-black text-[#022c22] tracking-tighter uppercase">Executive Settings</h2>
         <p className="text-slate-400 font-medium text-sm">Fine-tune Namma Orru's operational parameters.</p>
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
               
               <div className="relative z-10 space-y-10">
                  <div className="pb-8 border-b border-slate-50">
                     <h3 className="text-xl font-black text-[#022c22] tracking-tighter uppercase">{sections[activeTab].title} Configuration</h3>
                     <p className="text-xs text-slate-400 font-medium mt-1">{sections[activeTab].desc}</p>
                  </div>

                  {activeTab === 0 && (
                     <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Legal Brand Name</label>
                              <input type="text" defaultValue="Namma Orru Foods Ltd" className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20" />
                           </div>
                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Store Category</label>
                              <input type="text" defaultValue="Organic Essentials" className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20" />
                           </div>
                        </div>

                        <div className="flex flex-col gap-3">
                           <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Official Support Email</label>
                           <input type="email" defaultValue="care@nammaorru.com" className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20" />
                        </div>

                        <div className="flex flex-col gap-3">
                           <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">WhatsApp Hotline Number</label>
                           <input type="text" defaultValue="+91 98765 43210" className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20" />
                        </div>
                     </div>
                  )}

                  {activeTab === 4 && (
                     <div className="space-y-8">
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

                  {activeTab !== 0 && activeTab !== 4 && (
                     <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                           <Clock size={32} />
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-[#022c22] tracking-tight uppercase">Module Under Maintenance</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">This configuration set will be available in the next sync.</p>
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
