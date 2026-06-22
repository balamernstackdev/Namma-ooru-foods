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
   Save,
   Palette,
   Upload,
   AlertTriangle,
   Check,
   X,
   Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { API_URL } from '@/lib/api';

export default function AdminSettings() {
   const [activeTab, setActiveTab] = React.useState(0);
   const [loading, setLoading] = React.useState(true);

   // Store Profile States
   const [storeName, setStoreName] = React.useState('namma ooru Foods Ltd');
   const [storeCategory, setStoreCategory] = React.useState('Organic Essentials');
   const [supportEmail, setSupportEmail] = React.useState('support@nammaoorufoods.com');
   const [supportWhatsapp, setSupportWhatsapp] = React.useState('+91 9000 896 898');
   const [autoGenerateCategoryContent, setAutoGenerateCategoryContent] = React.useState(true);

   // Logistics States
   const [deliveryRadius, setDeliveryRadius] = React.useState(15);
   const [deliveryFee, setDeliveryFee] = React.useState(40);
   const [freeShippingThreshold, setFreeShippingThreshold] = React.useState(1000);
   const [shippingMinOrderAmount, setShippingMinOrderAmount] = React.useState(0);

   // UI, Toast, and Ref States
   const [saving, setSaving] = React.useState(false);
   const initialSettingsRef = React.useRef<Record<string, any>>({});

   // Payment States
   const [enableCod, setEnableCod] = React.useState(true);
   const [razorpayKey, setRazorpayKey] = React.useState('');
   const [razorpaySecret, setRazorpaySecret] = React.useState('');
   const [visibleGateway, setVisibleGateway] = React.useState('HDFC');
   const [gstNumber, setGstNumber] = React.useState('');
   const [hdfcMerchantId, setHdfcMerchantId] = React.useState('SG5067');
   const [hdfcClientId, setHdfcClientId] = React.useState('hdfcmaster');
   const [hdfcApiKey, setHdfcApiKey] = React.useState('EBBF2342D13404C9ACD436E5A437C4');
   const [hdfcApiUrl, setHdfcApiUrl] = React.useState('https://smartgateway.hdfcuat.bank.in/session');

   // Notification States
   const [orderEmail, setOrderEmail] = React.useState('orders@nammaoorufoods.com');
   const [enableWhatsappAlerts, setEnableWhatsappAlerts] = React.useState(true);
   const [lowStockThreshold, setLowStockThreshold] = React.useState(5);

   // Platform Branding States
   const [platformLogo, setPlatformLogo] = React.useState('/logo.webp');
   const [platformFavicon, setPlatformFavicon] = React.useState('/favicon.ico');
   const [primaryColor, setPrimaryColor] = React.useState('#064e3b');
   const [secondaryColor, setSecondaryColor] = React.useState('#f59e0b');
   const [uploadingImage, setUploadingImage] = React.useState(false);

   // Vendor Payouts States
   const [slabs, setSlabs] = React.useState([
      { min: 0, max: 12500, percentage: 30 },
      { min: 12500, max: 25000, percentage: 20 },
      { min: 25000, max: 125000, percentage: 10 },
      { min: 125000, max: null, percentage: 5 }
   ]);
   const [settlementDay, setSettlementDay] = React.useState('Monday');
   const [minPayout, setMinPayout] = React.useState(2000);

   // Tax & GST States
   const [gstEnabled, setGstEnabled] = React.useState(true);
   const [gstDefaultRate, setGstDefaultRate] = React.useState(18);
   const [gstTaxType, setGstTaxType] = React.useState('exclusive');
   const [gstTaxLabel, setGstTaxLabel] = React.useState('GST');
   const [gstRoundingEnabled, setGstRoundingEnabled] = React.useState(true);

    const hasUnsavedChanges = React.useMemo(() => {
       if (loading || !initialSettingsRef.current) return false;
       const current: Record<string, any> = {
          storeName, storeCategory, supportEmail, supportWhatsapp, autoGenerateCategoryContent,
          deliveryRadius, deliveryFee, freeShippingThreshold, shippingMinOrderAmount,
          enableCod, razorpayKey, razorpaySecret, activePaymentGateway: visibleGateway, gstNumber, hdfcMerchantId, hdfcClientId, hdfcApiKey, hdfcApiUrl,
          orderEmail, enableWhatsappAlerts, lowStockThreshold,
          platformLogo, platformFavicon, primaryColor, secondaryColor,
          settlementDay, minPayout,
          gstEnabled, gstDefaultRate, gstTaxType, gstTaxLabel, gstRoundingEnabled
       };

       const changed = Object.keys(current).some(key => {
          return current[key] !== initialSettingsRef.current[key];
       });

       if (changed) return true;

       if (JSON.stringify(slabs) !== JSON.stringify(initialSettingsRef.current.slabs)) {
          return true;
       }

       return false;
    }, [
       loading, storeName, storeCategory, supportEmail, supportWhatsapp, autoGenerateCategoryContent,
       deliveryRadius, deliveryFee, freeShippingThreshold, shippingMinOrderAmount,
       enableCod, razorpayKey, razorpaySecret, visibleGateway, gstNumber, hdfcMerchantId, hdfcClientId, hdfcApiKey, hdfcApiUrl,
       orderEmail, enableWhatsappAlerts, lowStockThreshold,
       platformLogo, platformFavicon, primaryColor, secondaryColor,
       slabs, settlementDay, minPayout,
       gstEnabled, gstDefaultRate, gstTaxType, gstTaxLabel, gstRoundingEnabled
    ]);

    React.useEffect(() => {
       const handleBeforeUnload = (e: BeforeUnloadEvent) => {
          if (hasUnsavedChanges) {
             e.preventDefault();
             e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
             return e.returnValue;
          }
       };
       window.addEventListener('beforeunload', handleBeforeUnload);
       return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);


    const fetchSettings = React.useCallback(async () => {
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
               const autoGenSetting = data.find((s: any) => s.key === 'auto_generate_category_content');

               // Logistics
               const radiusSetting = data.find((s: any) => s.key === 'delivery_radius');
               const feeSetting = data.find((s: any) => s.key === 'delivery_fee');
               const thresholdSetting = data.find((s: any) => s.key === 'free_shipping_threshold');
               const minOrderAmountSetting = data.find((s: any) => s.key === 'shipping_min_order_amount');

               // Payments
               const codSetting = data.find((s: any) => s.key === 'enable_cod');
               const razorpaySetting = data.find((s: any) => s.key === 'razorpay_key');
               const razorpaySecretSetting = data.find((s: any) => s.key === 'razorpay_secret');
               const activeGatewaySetting = data.find((s: any) => s.key === 'active_payment_gateway');
               const gstSetting = data.find((s: any) => s.key === 'gst_number');
               const hdfcMerchantSetting = data.find((s: any) => s.key === 'hdfc_merchant_id');
               const hdfcClientSetting = data.find((s: any) => s.key === 'hdfc_client_id');
               const hdfcApiSetting = data.find((s: any) => s.key === 'hdfc_api_key');
               const hdfcUrlSetting = data.find((s: any) => s.key === 'hdfc_api_url');

               // Notifications
               const orderEmailSetting = data.find((s: any) => s.key === 'notification_order_email');
               const whatsappAlertSetting = data.find((s: any) => s.key === 'enable_whatsapp_alerts');
               const stockSetting = data.find((s: any) => s.key === 'low_stock_threshold');

               // GST Settings
               const gstEnabledSetting = data.find((s: any) => s.key === 'gst_enabled');
               const gstDefaultRateSetting = data.find((s: any) => s.key === 'gst_default_rate');
               const gstTaxTypeSetting = data.find((s: any) => s.key === 'gst_tax_type');
               const gstTaxLabelSetting = data.find((s: any) => s.key === 'gst_tax_label');
               const gstRoundingEnabledSetting = data.find((s: any) => s.key === 'gst_rounding_enabled');

               // Platform Branding
               const logoSetting = data.find((s: any) => s.key === 'platform_logo');
               const faviconSetting = data.find((s: any) => s.key === 'platform_favicon');
               const primaryColorSetting = data.find((s: any) => s.key === 'platform_primary_color');
               const secondaryColorSetting = data.find((s: any) => s.key === 'platform_secondary_color');

                const valSlabs = slabsSetting ? JSON.parse(slabsSetting.value) : [
                   { min: 0, max: 12500, percentage: 30 },
                   { min: 12500, max: 25000, percentage: 20 },
                   { min: 25000, max: 125000, percentage: 10 },
                   { min: 125000, max: null, percentage: 5 }
                ];
                const valSettlementDay = daySetting?.value || 'Monday';
                const valMinPayout = payoutSetting ? Number(payoutSetting.value) : 2000;

                const valStoreName = nameSetting?.value || 'namma ooru Foods Ltd';
                const valStoreCategory = catSetting?.value || 'Organic Essentials';
                const valSupportEmail = emailSetting?.value || 'support@nammaoorufoods.com';
                const valSupportWhatsapp = whatsappSetting?.value || '+91 9000 896 898';
                const valAutoGen = autoGenSetting ? autoGenSetting.value === 'true' : true;

                const valRadius = radiusSetting ? Number(radiusSetting.value) : 15;
                const valFee = feeSetting ? Number(feeSetting.value) : 40;
                const valThreshold = thresholdSetting ? Number(thresholdSetting.value) : 1000;
                const valMinOrderAmount = minOrderAmountSetting ? Number(minOrderAmountSetting.value) : 0;

                const valCod = codSetting ? codSetting.value === 'true' : true;
                const valRazorpay = razorpaySetting?.value || '';
                const valRazorpaySecret = razorpaySecretSetting?.value || '';
                const valActiveGateway = activeGatewaySetting?.value || 'HDFC';
                const valGstNum = gstSetting?.value || '';
                const valHdfcMerch = hdfcMerchantSetting?.value || 'SG5067';
                const valHdfcClient = hdfcClientSetting?.value || 'hdfcmaster';
                const valHdfcKey = hdfcApiSetting?.value || 'EBBF2342D13404C9ACD436E5A437C4';
                const valHdfcUrl = hdfcUrlSetting?.value || 'https://smartgateway.hdfcuat.bank.in/session';

                const valOrderEmail = orderEmailSetting?.value || 'orders@nammaoorufoods.com';
                const valWhatsappAlerts = whatsappAlertSetting ? whatsappAlertSetting.value === 'true' : true;
                const valStockThresh = stockSetting ? Number(stockSetting.value) : 5;

                const valLogo = logoSetting?.value || '/logo.webp';
                const valFavicon = faviconSetting?.value || '/favicon.ico';
                const valPrimaryColor = primaryColorSetting?.value || '#064e3b';
                const valSecondaryColor = secondaryColorSetting?.value || '#f59e0b';

                const valGstEnabled = gstEnabledSetting ? gstEnabledSetting.value === 'true' : true;
                const valGstRate = gstDefaultRateSetting ? Number(gstDefaultRateSetting.value) : 18;
                const valGstType = gstTaxTypeSetting?.value || 'exclusive';
                const valGstLabel = gstTaxLabelSetting?.value || 'GST';
                const valGstRound = gstRoundingEnabledSetting ? gstRoundingEnabledSetting.value === 'true' : true;

                // Save to reference for unsaved changes detection
                initialSettingsRef.current = {
                   storeName: valStoreName, storeCategory: valStoreCategory, supportEmail: valSupportEmail, supportWhatsapp: valSupportWhatsapp, autoGenerateCategoryContent: valAutoGen,
                   deliveryRadius: valRadius, deliveryFee: valFee, freeShippingThreshold: valThreshold, shippingMinOrderAmount: valMinOrderAmount,
                   enableCod: valCod, razorpayKey: valRazorpay, razorpaySecret: valRazorpaySecret, activePaymentGateway: valActiveGateway, gstNumber: valGstNum, hdfcMerchantId: valHdfcMerch, hdfcClientId: valHdfcClient, hdfcApiKey: valHdfcKey, hdfcApiUrl: valHdfcUrl,
                   orderEmail: valOrderEmail, enableWhatsappAlerts: valWhatsappAlerts, lowStockThreshold: valStockThresh,
                   platformLogo: valLogo, platformFavicon: valFavicon, primaryColor: valPrimaryColor, secondaryColor: valSecondaryColor,
                   slabs: valSlabs, settlementDay: valSettlementDay, minPayout: valMinPayout,
                   gstEnabled: valGstEnabled, gstDefaultRate: valGstRate, gstTaxType: valGstType, gstTaxLabel: valGstLabel, gstRoundingEnabled: valGstRound
                };

                setSlabs(valSlabs);
                setSettlementDay(valSettlementDay);
                setMinPayout(valMinPayout);
                setStoreName(valStoreName);
                setStoreCategory(valStoreCategory);
                setSupportEmail(valSupportEmail);
                setSupportWhatsapp(valSupportWhatsapp);
                setAutoGenerateCategoryContent(valAutoGen);
                setDeliveryRadius(valRadius);
                setDeliveryFee(valFee);
                setFreeShippingThreshold(valThreshold);
                setShippingMinOrderAmount(valMinOrderAmount);
                setEnableCod(valCod);
                setRazorpayKey(valRazorpay);
                setRazorpaySecret(valRazorpaySecret);
                setVisibleGateway(valActiveGateway);
                setGstNumber(valGstNum);
                setHdfcMerchantId(valHdfcMerch);
                setHdfcClientId(valHdfcClient);
                setHdfcApiKey(valHdfcKey);
                setHdfcApiUrl(valHdfcUrl);
                setOrderEmail(valOrderEmail);
                setEnableWhatsappAlerts(valWhatsappAlerts);
                setLowStockThreshold(valStockThresh);
                setPlatformLogo(valLogo);
                setPlatformFavicon(valFavicon);
                setPrimaryColor(valPrimaryColor);
                setSecondaryColor(valSecondaryColor);
                setGstEnabled(valGstEnabled);
                setGstDefaultRate(valGstRate);
                setGstTaxType(valGstType);
                setGstTaxLabel(valGstLabel);
                setGstRoundingEnabled(valGstRound);
            }
         } catch (error) {
            console.error('Error fetching settings:', error);
       } finally {
          setLoading(false);
       }
    }, []);

    React.useEffect(() => {
       fetchSettings();
    }, [fetchSettings]);

    const handleReset = () => {
       const init = initialSettingsRef.current;
       if (!init) return;

       setStoreName(init.storeName);
       setStoreCategory(init.storeCategory);
       setSupportEmail(init.supportEmail);
       setSupportWhatsapp(init.supportWhatsapp);
       setAutoGenerateCategoryContent(init.autoGenerateCategoryContent);

       setDeliveryRadius(init.deliveryRadius);
       setDeliveryFee(init.deliveryFee);
       setFreeShippingThreshold(init.freeShippingThreshold);
       setShippingMinOrderAmount(init.shippingMinOrderAmount);

       setEnableCod(init.enableCod);
       setRazorpayKey(init.razorpayKey);
       setRazorpaySecret(init.razorpaySecret);
       setVisibleGateway(init.activePaymentGateway);
       setGstNumber(init.gstNumber);
       setHdfcMerchantId(init.hdfcMerchantId);
       setHdfcClientId(init.hdfcClientId);
       setHdfcApiKey(init.hdfcApiKey);
       setHdfcApiUrl(init.hdfcApiUrl);

       setOrderEmail(init.orderEmail);
       setEnableWhatsappAlerts(init.enableWhatsappAlerts);
       setLowStockThreshold(init.lowStockThreshold);

       setPlatformLogo(init.platformLogo);
       setPlatformFavicon(init.platformFavicon);
       setPrimaryColor(init.primaryColor);
       setSecondaryColor(init.secondaryColor);

       setSlabs(init.slabs);
       setSettlementDay(init.settlementDay);
       setMinPayout(init.minPayout);

       setGstEnabled(init.gstEnabled);
       setGstDefaultRate(init.gstDefaultRate);
       setGstTaxType(init.gstTaxType);
       setGstTaxLabel(init.gstTaxLabel);
       setGstRoundingEnabled(init.gstRoundingEnabled);
       toast.success('Changes reset successfully.');
    };

    const handleSave = async () => {
       if (saving) return;
       if (!hasUnsavedChanges) {
          toast('No changes detected.', { icon: 'ℹ️' });
          return;
       }
       setSaving(true);
       try {
          const settingsToUpdate = [
             { key: 'vendor_commission_slabs', value: JSON.stringify(slabs), type: 'JSON', group: 'VENDOR' },
             { key: 'settlement_day', value: settlementDay, type: 'STRING', group: 'VENDOR' },
             { key: 'min_payout_value', value: minPayout.toString(), type: 'NUMBER', group: 'VENDOR' },

             { key: 'gst_enabled', value: gstEnabled.toString(), type: 'BOOLEAN', group: 'GST' },
             { key: 'gst_default_rate', value: gstDefaultRate.toString(), type: 'NUMBER', group: 'GST' },
             { key: 'gst_tax_type', value: gstTaxType, type: 'STRING', group: 'GST' },
             { key: 'gst_tax_label', value: gstTaxLabel, type: 'STRING', group: 'GST' },
             { key: 'gst_rounding_enabled', value: gstRoundingEnabled.toString(), type: 'BOOLEAN', group: 'GST' },

             { key: 'store_name', value: storeName, type: 'STRING', group: 'STORE' },
             { key: 'store_category', value: storeCategory, type: 'STRING', group: 'STORE' },
             { key: 'support_email', value: supportEmail, type: 'STRING', group: 'STORE' },
             { key: 'support_whatsapp', value: supportWhatsapp, type: 'STRING', group: 'STORE' },
             { key: 'auto_generate_category_content', value: autoGenerateCategoryContent.toString(), type: 'BOOLEAN', group: 'STORE' },

             { key: 'delivery_radius', value: deliveryRadius.toString(), type: 'NUMBER', group: 'LOGISTICS' },
             { key: 'delivery_fee', value: deliveryFee.toString(), type: 'NUMBER', group: 'LOGISTICS' },
             { key: 'free_shipping_threshold', value: freeShippingThreshold.toString(), type: 'NUMBER', group: 'LOGISTICS' },
             { key: 'shipping_min_order_amount', value: shippingMinOrderAmount.toString(), type: 'NUMBER', group: 'LOGISTICS' },

             { key: 'enable_cod', value: enableCod.toString(), type: 'BOOLEAN', group: 'PAYMENT' },
             { key: 'razorpay_key', value: razorpayKey, type: 'STRING', group: 'PAYMENT' },
             { key: 'razorpay_secret', value: razorpaySecret, type: 'STRING', group: 'PAYMENT' },
             { key: 'active_payment_gateway', value: visibleGateway, type: 'STRING', group: 'PAYMENT' },
             { key: 'gst_number', value: gstNumber, type: 'STRING', group: 'PAYMENT' },
             { key: 'hdfc_merchant_id', value: hdfcMerchantId, type: 'STRING', group: 'PAYMENT' },
             { key: 'hdfc_client_id', value: hdfcClientId, type: 'STRING', group: 'PAYMENT' },
             { key: 'hdfc_api_key', value: hdfcApiKey, type: 'STRING', group: 'PAYMENT' },
             { key: 'hdfc_api_url', value: hdfcApiUrl, type: 'STRING', group: 'PAYMENT' },

             { key: 'notification_order_email', value: orderEmail, type: 'STRING', group: 'NOTIF' },
             { key: 'enable_whatsapp_alerts', value: enableWhatsappAlerts.toString(), type: 'BOOLEAN', group: 'NOTIF' },
             { key: 'low_stock_threshold', value: lowStockThreshold.toString(), type: 'NUMBER', group: 'NOTIF' },

             { key: 'platform_name', value: storeName, type: 'STRING', group: 'PLATFORM' },
             { key: 'platform_logo', value: platformLogo, type: 'STRING', group: 'PLATFORM' },
             { key: 'platform_favicon', value: platformFavicon, type: 'STRING', group: 'PLATFORM' },
             { key: 'platform_primary_color', value: primaryColor, type: 'STRING', group: 'PLATFORM' },
             { key: 'platform_secondary_color', value: secondaryColor, type: 'STRING', group: 'PLATFORM' }
          ];

          const response = await fetch(`${API_URL}/api/settings/bulk`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ settings: settingsToUpdate })
          });

          if (response.ok) {
             await fetchSettings();
             toast.success('Settings saved successfully.');
          } else {
             toast.error('Failed to save settings. Please try again.');
          }
       } catch (error) {
          console.error('Error saving settings:', error);
          toast.error('Failed to save settings. Please try again.');
       } finally {
          setSaving(false);
       }
   };

   const handleImageUpload = async (file: File, type: 'logo' | 'favicon') => {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
         const response = await fetch(`${API_URL}/api/upload/image`, {
            method: 'POST',
            body: formData,
         });

         if (response.ok) {
            const data = await response.json();
            if (type === 'logo') setPlatformLogo(data.url || data.imageUrl);
            else setPlatformFavicon(data.url || data.imageUrl);
         } else {
            alert('Failed to upload image.');
         }
      } catch (error) {
         console.error('Error uploading image:', error);
         alert('Error uploading image.');
      } finally {
         setUploadingImage(false);
      }
   };

   const sections = [
      {
         title: 'Platform Branding',
         desc: 'Centralized Logo, Favicon, and Colors.',
         icon: Palette,
         fields: ['Platform Logo', 'Favicon', 'Primary Color', 'Secondary Color']
      },
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
         fields: ['Enable COD', 'HDFC Integration', 'Tax (GST) Settings']
      },
      {
         title: 'Vendor Payouts',
         desc: 'Commission slabs and settlement cycles.',
         icon: ShieldCheck,
         fields: ['Commission Slabs', 'Settlement Day', 'Minimum Payout']
      },
      {
         title: 'Tax & GST Settings',
         desc: 'Global GST switch, rates, type, and rounding settings.',
         icon: Settings,
         fields: ['Enable GST', 'Default GST Rate', 'Tax Type', 'Tax Label', 'Rounding']
      }
   ];

   return (
      <div className="w-full space-y-10">

         {/* Header */}
         <div className="space-y-1">
            <h2 className="text-3xl font-black text-[#022c22] tracking-tighter uppercase">Admin Global Settings</h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Fine-tune namma ooru's operational parameters.</p>
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
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-5 sm:p-10 overflow-hidden relative">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10 space-y-6">
                     <div className="pb-4 border-b border-slate-50">
                        <h3 className="text-xl font-black text-[#022c22] tracking-tighter uppercase">{sections[activeTab].title} Configuration</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">{sections[activeTab].desc}</p>
                     </div>

                     {activeTab === 0 && (
                        <div className="space-y-6">
                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Platform Logo</label>
                              <div className="flex items-center gap-4">
                                 <div className="h-20 w-40 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-2">
                                    <img src={platformLogo || '/logo.webp'} alt="Logo" className="w-full h-full object-contain" />
                                 </div>
                                 <div>
                                    <input type="file" id="logoUpload" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')} />
                                    <label htmlFor="logoUpload" className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-all">
                                       <Upload size={14} /> {uploadingImage ? 'Uploading...' : 'Change Logo'}
                                    </label>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Favicon</label>
                              <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1">
                                    <img src={platformFavicon || '/favicon.ico'} alt="Favicon" className="w-full h-full object-contain" />
                                 </div>
                                 <div>
                                    <input type="file" id="faviconUpload" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'favicon')} />
                                    <label htmlFor="faviconUpload" className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-all">
                                       <Upload size={14} /> {uploadingImage ? 'Uploading...' : 'Change Favicon'}
                                    </label>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Primary Color</label>
                                 <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-slate-50">
                                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                                    <span className="font-bold text-[#022c22] uppercase font-mono">{primaryColor}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Secondary Color</label>
                                 <div className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-slate-50">
                                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                                    <span className="font-bold text-[#022c22] uppercase font-mono">{secondaryColor}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 1 && (
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

                     {activeTab === 2 && (
                        <div className="space-y-6 text-left">

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Min Order for Delivery (₹)</label>
                                 <input
                                    type="number"
                                    min="0"
                                    value={shippingMinOrderAmount}
                                    onChange={(e) => setShippingMinOrderAmount(Math.max(0, Number(e.target.value) || 0))}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                                 />
                              </div>
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Flat Delivery Fee (₹)</label>
                                 <input
                                    type="number"
                                    min="0"
                                    value={deliveryFee}
                                    onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value) || 0))}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                                 />
                              </div>
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Free Delivery Above (₹)</label>
                                 <input
                                    type="number"
                                    min="0"
                                    value={freeShippingThreshold}
                                    onChange={(e) => setFreeShippingThreshold(Math.max(0, Number(e.target.value) || 0))}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 3 && (
                        <div className="space-y-6">
                           <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configure Gateway</label>
                              <select
                                 value={visibleGateway}
                                 onChange={(e) => setVisibleGateway(e.target.value)}
                                 className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-[#022c22] focus:border-emerald-500 transition-all text-sm w-full md:w-64"
                              >
                                 <option value="HDFC">HDFC SmartGateway</option>
                                 <option value="Razorpay">Razorpay</option>
                              </select>
                           </div>

                           {/* HDFC SmartGateway Integration */}
                           {visibleGateway === 'HDFC' && (
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
                           )}

                           {/* Razorpay Integration */}
                           {visibleGateway === 'Razorpay' && (
                              <div className="p-6 border border-slate-100 rounded-3xl bg-[#022c22]/[0.02] space-y-5">
                                 <h4 className="text-xs font-black uppercase tracking-wider text-[#022c22] border-l-2 border-emerald-500 pl-3">Razorpay Configuration</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-2">
                                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Razorpay Key ID</label>
                                       <input
                                          type="text"
                                          value={razorpayKey}
                                          onChange={(e) => setRazorpayKey(e.target.value)}
                                          className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-[#022c22] focus:border-emerald-500 transition-all text-sm"
                                       />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Razorpay Key Secret</label>
                                       <input
                                          type="password"
                                          value={razorpaySecret}
                                          onChange={(e) => setRazorpaySecret(e.target.value)}
                                          className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-[#022c22] focus:border-emerald-500 transition-all text-sm"
                                       />
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                     )}

                     {activeTab === 4 && (
                        <div className="space-y-6">
                           <div className="flex flex-col gap-2">
                              <h4 className="text-[11px] font-black uppercase tracking-[.3em] text-slate-400 mb-2">Weekly Vendor Settlement Slabs</h4>
                              <div className="space-y-4">
                                 {slabs.map((slab, i) => (
                                    <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
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
                              </div>                              <div className="flex flex-col gap-3">
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

                     {activeTab === 5 && (
                        <div className="space-y-6">
                           <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex-1">
                                 <h4 className="text-sm font-bold text-slate-900">Enable GST</h4>
                                 <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Globally enable or disable GST calculations.</p>
                              </div>
                              <button
                                 type="button"
                                 onClick={() => setGstEnabled(!gstEnabled)}
                                 className={`h-7 w-12 rounded-full transition-all relative ${gstEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              >
                                 <div className={`h-5 w-5 rounded-full bg-white absolute top-1 transition-all ${gstEnabled ? 'right-1' : 'left-1'}`} />
                              </button>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Default GST Rate (%)</label>
                                 <select
                                    value={gstDefaultRate}
                                    onChange={(e) => setGstDefaultRate(Number(e.target.value))}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20 appearance-none cursor-pointer"
                                 >
                                    <option value="0">0%</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                 </select>
                              </div>

                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Tax Mode</label>
                                 <select
                                    value={gstTaxType}
                                    onChange={(e) => setGstTaxType(e.target.value)}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20 appearance-none cursor-pointer"
                                 >
                                    <option value="exclusive">Exclusive (Add tax on top of price)</option>
                                    <option value="inclusive">Inclusive (Price includes tax)</option>
                                 </select>
                              </div>
                           </div>

                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Tax Label</label>
                              <input
                                 type="text"
                                 value={gstTaxLabel}
                                 onChange={(e) => setGstTaxLabel(e.target.value)}
                                 className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-emerald-400/20"
                              />
                           </div>

                           <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex-1">
                                 <h4 className="text-sm font-bold text-slate-900">Enable Rounding</h4>
                                 <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Round GST amounts to the nearest whole integer.</p>
                              </div>
                              <button
                                 type="button"
                                 onClick={() => setGstRoundingEnabled(!gstRoundingEnabled)}
                                 className={`h-7 w-12 rounded-full transition-all relative ${gstRoundingEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              >
                                 <div className={`h-5 w-5 rounded-full bg-white absolute top-1 transition-all ${gstRoundingEnabled ? 'right-1' : 'left-1'}`} />
                              </button>
                           </div>
                        </div>
                     )}



                     <div className="pt-8 flex justify-end gap-4">
                        <button
                           onClick={handleSave}
                           disabled={saving}
                           className={`h-14 px-10 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/10 active:scale-95 transition-all ${saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#022c22]'}`}
                        >
                           {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                           {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
