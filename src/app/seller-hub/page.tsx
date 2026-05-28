'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { API_URL } from '@/lib/api';

export default function SellerHubPage() {
  const [formData, setFormData] = useState({
    businessName: '', ownerName: '', email: '', mobileNumber: '', whatsappNumber: '',
    businessType: 'Individual', productCategories: [] as string[], yearsExperience: '',
    gstNumber: '', fssaiNumber: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
    brandName: '', website: '', aboutBrand: '', agreedToPolicies: false, customCategory: ''
  });
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'agreedToPolicies') {
        setFormData({ ...formData, [name]: checked });
      } else {
        // Handle categories array
        const categories = [...formData.productCategories];
        if (checked) {
          categories.push(name);
        } else {
          const index = categories.indexOf(name);
          if (index > -1) categories.splice(index, 1);
        }
        setFormData({ ...formData, productCategories: categories });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToPolicies) {
      setError('You must agree to the marketplace policies.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const finalData = { ...formData };
      if (showCustomCategory && finalData.customCategory.trim() !== '') {
        finalData.productCategories = [...finalData.productCategories, finalData.customCategory.trim()];
      }
      if (sameAsMobile) {
        finalData.whatsappNumber = finalData.mobileNumber;
      }

      const response = await fetch(`${API_URL}/api/vendor-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalData)
      });

      if (!response.ok) {
        let errorMsg = 'Submission failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          errorMsg = 'Server error or network issue. Please try again.';
        }
        throw new Error(errorMsg);
      }

      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      const formEl = document.getElementById('register-form');
      if (formEl) {
        window.scrollTo({ top: formEl.offsetTop - 100, behavior: 'smooth' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-emerald-900/10">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-black text-emerald-950 mb-4">Request Submitted!</h2>
          <p className="text-emerald-900/70 mb-8 font-medium">Your vendor request has been submitted successfully. Our team will review your application and contact you shortly.</p>
          <div className="space-y-4 text-left bg-[#fdfbf7] p-6 rounded-2xl">
            <h4 className="font-bold text-emerald-950 text-sm uppercase tracking-wider">Next Steps</h4>
            <ul className="text-sm text-emerald-900/80 space-y-3">
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Application Review (24-48 hrs)</li>
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Document Verification</li>
              <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Account Activation</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans">
      {/* HERO SECTION */}
      <section className="relative pt-8 pb-10 lg:pt-12 lg:pb-16 overflow-hidden px-4">
        <div className="absolute inset-0 bg-emerald-950/5 opacity-[0.03] pointer-events-none mix-blend-multiply" />
        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-bold text-xs uppercase tracking-widest mb-6 inline-block">Seller Hub</span>
              <h1 className="text-4xl lg:text-6xl font-black text-emerald-950 leading-tight mb-6">
                Grow Your Organic Brand With <span className="text-amber-600">Namma Ooru Foods</span>
              </h1>
              <p className="text-lg text-emerald-900/70 font-medium mb-10 max-w-lg">
                Join our trusted marketplace and sell directly to thousands of customers looking for authentic, organic, and traditional foods.
              </p>

              <div className="flex flex-wrap gap-6 mb-10">
                <div>
                  <h4 className="text-3xl font-black text-emerald-950">50K+</h4>
                  <p className="text-sm font-bold uppercase text-emerald-900/50 tracking-wider">Customers</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-emerald-950">500+</h4>
                  <p className="text-sm font-bold uppercase text-emerald-900/50 tracking-wider">Products</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-emerald-950">24/7</h4>
                  <p className="text-sm font-bold uppercase text-emerald-900/50 tracking-wider">Support</p>
                </div>
              </div>

              <button onClick={() => document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' })} className="bg-emerald-950 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Start Selling Now
              </button>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-emerald-900/20 z-0"></div>
            <Image
              src="/organic_seller_hero.png"
              alt="Organic farm fresh produce"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-12 lg:py-16 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-emerald-950 mb-4">Why Sell With Us?</h2>
            <p className="text-emerald-900/60 font-medium max-w-2xl mx-auto">Experience a premium seller dashboard with all the tools you need to manage and scale your brand.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Easy Onboarding', desc: 'Get your store up and running in less than 48 hours with our guided setup.' },
              { title: 'Vendor Dashboard', desc: 'Track sales, manage inventory, and view analytics in real-time.' },
              { title: 'Order Management', desc: 'Seamlessly process orders, print labels, and track shipments.' },
              { title: 'Marketing Support', desc: 'Participate in sitewide promotions and get featured on our homepage.' },
              { title: 'Secure Payments', desc: 'Receive fast, reliable payouts directly to your bank account.' },
              { title: 'Dedicated Support', desc: 'Get 24/7 help from our vendor success team to grow your business.' }
            ].map((benefit, i) => (
              <div key={i} className="p-8 rounded-3xl bg-[#fdfbf7] border border-emerald-900/5 hover:shadow-xl hover:border-amber-200 transition-all duration-300 group">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full group-hover:bg-amber-600 transition-colors"></div>
                </div>
                <h3 className="text-xl font-bold text-emerald-950 mb-3">{benefit.title}</h3>
                <p className="text-emerald-900/70 font-medium leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRATION FORM */}
      <section id="register-form" className="py-12 lg:py-16 px-4 bg-[#fdfbf7]">
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl p-6 lg:p-10 border border-emerald-900/10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-emerald-950 mb-3">Vendor Registration</h2>
            <p className="text-emerald-900/60 font-medium">Fill out the form below to apply for a seller account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* Section 1: Business Info */}
            <div>
              <h3 className="text-xl font-bold text-emerald-950 mb-6 pb-2 border-b border-emerald-900/10">1. Business Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">Business Name *</label>
                  <input required name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">Owner Full Name *</label>
                  <input required name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">Email Address *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">Mobile Number *</label>
                  <input required name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">WhatsApp Number</label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={sameAsMobile} onChange={(e) => setSameAsMobile(e.target.checked)} className="accent-amber-600 w-3 h-3" />
                      <span className="text-[10px] font-bold text-emerald-900/60 uppercase group-hover:text-emerald-950 transition-colors">Same as Mobile</span>
                    </label>
                  </div>
                  {!sameAsMobile && (
                    <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Business Details */}
            <div>
              <h3 className="text-xl font-bold text-emerald-950 mb-6 pb-2 border-b border-emerald-900/10">2. Business Details</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">Business Type *</label>
                  <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors">
                    <option value="Individual">Individual</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Company">Company</option>
                    <option value="Farmer Group">Farmer Group</option>
                    <option value="Homemade Products">Homemade Products</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">Years of Experience</label>
                  <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3 block">Product Categories</label>
                <div className="flex flex-wrap gap-3 items-center">
                  {['Oils', 'Millets', 'Masalas', 'Snacks', 'Health Mixes', 'Rice Products', 'Homemade Foods'].map(cat => (
                    <label key={cat} className="flex items-center gap-2 bg-[#fdfbf7] border border-emerald-900/10 px-4 py-2 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                      <input type="checkbox" name={cat} checked={formData.productCategories.includes(cat)} onChange={handleInputChange} className="accent-amber-600 w-4 h-4" />
                      <span className="text-sm font-medium text-emerald-950">{cat}</span>
                    </label>
                  ))}

                  <label className="flex items-center gap-2 bg-[#fdfbf7] border border-emerald-900/10 px-4 py-2 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                    <input type="checkbox" checked={showCustomCategory} onChange={(e) => setShowCustomCategory(e.target.checked)} className="accent-amber-600 w-4 h-4" />
                    <span className="text-sm font-medium text-emerald-950">Customize Type</span>
                  </label>

                  {showCustomCategory && (
                    <input
                      type="text"
                      name="customCategory"
                      value={formData.customCategory}
                      onChange={handleInputChange}
                      placeholder="e.g. Organic Honey..."
                      className="bg-white border-2 border-emerald-900/10 rounded-xl px-4 py-2 text-emerald-950 focus:border-amber-500 outline-none font-medium text-sm transition-colors w-full md:w-auto min-w-[220px]"
                    />
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">GST Number (Optional)</label>
                  <input name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">FSSAI Number (Optional)</label>
                  <input name="fssaiNumber" value={formData.fssaiNumber} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
              </div>
            </div>

            {/* Section 3: Address Info */}
            <div>
              <h3 className="text-xl font-bold text-emerald-950 mb-6 pb-2 border-b border-emerald-900/10">3. Address Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">Address Line 1 *</label>
                  <input required name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">Address Line 2</label>
                  <input name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">City *</label>
                  <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">State *</label>
                  <input required name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">Pincode *</label>
                  <input required name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
              </div>
            </div>

            {/* Section 4: Brand Info */}
            <div>
              <h3 className="text-xl font-bold text-emerald-950 mb-6 pb-2 border-b border-emerald-900/10">4. Brand Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">Brand Name *</label>
                  <input required name="brandName" value={formData.brandName} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">Website / Instagram (Optional)</label>
                  <input name="website" value={formData.website} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">About Your Brand</label>
                  <textarea rows={4} name="aboutBrand" value={formData.aboutBrand} onChange={handleInputChange} className="w-full bg-[#fdfbf7] border-2 border-emerald-900/10 rounded-xl px-4 py-3 text-emerald-950 focus:border-amber-500 outline-none font-medium transition-colors"></textarea>
                </div>
              </div>
            </div>

            {/* Agreement and Submit */}
            <div className="pt-8 border-t border-emerald-900/10">
              <label className="flex items-start gap-4 cursor-pointer group mb-8">
                <div className="mt-1">
                  <input type="checkbox" name="agreedToPolicies" checked={formData.agreedToPolicies} onChange={handleInputChange} className="w-5 h-5 accent-amber-600 rounded border-emerald-900/20" />
                </div>
                <p className="text-sm font-medium text-emerald-900/80 group-hover:text-emerald-950 transition-colors">
                  I agree to the <span className="text-amber-600 underline">marketplace vendor policies</span> and understand that my account is subject to a verification process before approval.
                </p>
              </label>

              <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-950 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Submitting...' : 'Submit Vendor Request'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
