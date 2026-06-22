const fs = require('fs');
let code = fs.readFileSync('src/app/admin/marketing/popup-campaigns/create/page.tsx', 'utf8');

const returnStart = code.indexOf('  return (');
const returnEnd = code.lastIndexOf('  );\n}');
if (returnStart === -1 || returnEnd === -1) {
  console.log('Could not find return block');
  process.exit(1);
}

const beforeReturn = code.substring(0, returnStart);
const afterReturn = code.substring(returnEnd);

const newReturnBlock = `  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/marketing/popup-campaigns"
          className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
            New <span className="text-emerald-600">Popup Campaign</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
            Build and launch a simple, dynamic marketing popup
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* TOP SECTION: Split Layout (Form + Preview) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          
          {/* Left Column (Basic Info) */}
          <div className="space-y-6">
          
            {/* Card 1: Campaign Status & General Settings */}
            <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campaign Status</span>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'active', label: 'Active', color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', activeBg: 'bg-emerald-50' },
                    { id: 'scheduled', label: 'Scheduled', color: 'bg-amber-400', text: 'text-amber-700', border: 'border-amber-200', activeBg: 'bg-amber-50' },
                    { id: 'disabled', label: 'Disabled', color: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200', activeBg: 'bg-rose-50' }
                  ].map(opt => {
                    const isSelected = statusMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setStatusMode(opt.id as any);
                          setFormData({ ...formData, status: opt.id === 'scheduled' ? 'active' : opt.id });
                        }}
                        className={\`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all \${
                          isSelected 
                            ? \`\${opt.border} \${opt.activeBg} \${opt.text} shadow-sm\` 
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }\`}
                      >
                        <span className={\`h-1.5 w-1.5 rounded-full \${isSelected ? opt.color : 'bg-slate-300'}\`} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campaign Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Mega Sale 2024"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Offer Subtitle (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. valid till stocks last"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Get 50% off on all items!"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Popup Layout Type</label>
                  <select
                    value={formData.popupType}
                    onChange={e => setFormData({ ...formData, popupType: e.target.value })}
                    className="h-12 w-full px-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-xs text-slate-700 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
                  >
                    <option value="NEWSLETTER">Newsletter Subscription</option>
                    <option value="FIRST_ORDER">First Order Offer</option>
                    <option value="COUPON">Coupon Highlight</option>
                    <option value="ANNOUNCEMENT">Announcement</option>
                    <option value="FESTIVAL">Festival Offer</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          {/* End of Left Column */}

          {/* Live Preview Column (Sticky) */}
          <div className="bg-slate-900 rounded-[30px] p-6 sm:p-8 border border-slate-800 shadow-2xl sticky top-8 text-white min-h-[520px] flex flex-col justify-between overflow-hidden">
            {/* Preview Header / Device Toggle */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Live Visual Preview
              </span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={\`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all \${
                    previewMode === 'desktop' ? 'bg-amber-400 text-emerald-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
                  }\`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={\`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all \${
                    previewMode === 'mobile' ? 'bg-amber-400 text-emerald-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
                  }\`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Preview Render Area */}
            <div className="flex-1 flex items-center justify-center pt-8">
              {previewMode === 'desktop' ? (
                <div className="w-[600px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300 relative">
                  <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  {previewDesktopImage ? (
                    <div className="h-[300px] w-full bg-cover bg-center relative" style={{ backgroundImage: \`url('\${previewDesktopImage}')\` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-[200px] w-full bg-slate-50 flex items-center justify-center border-b border-slate-100">
                      <ImageIcon className="text-slate-200" size={48} />
                    </div>
                  )}
                  <div className="p-8 text-center space-y-4 relative bg-white">
                    {formData.popupType === 'COUPON' && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                        {formData.discountPct ? \`\${formData.discountPct}% OFF\` : 'SPECIAL OFFER'}
                      </div>
                    )}
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {formData.title || 'Your Campaign Title Here'}
                    </h2>
                    {formData.subtitle && (
                      <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest">
                        {formData.subtitle}
                      </p>
                    )}
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                      {formData.description || 'Add a compelling description to entice your users...'}
                    </p>
                    
                    {formData.popupType === 'COUPON' && (
                      <div className="pt-2 pb-1">
                        <div className="relative flex items-center justify-center h-12 w-64 mx-auto border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-xl">
                          <span className="font-mono font-black tracking-widest text-emerald-800 text-lg">
                            {formData.couponCode || 'SAVE20'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handlePreviewCopy}
                          disabled={isPreviewCopied}
                          className={\`mt-3 h-10 px-6 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all \${
                            isPreviewCopied 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }\`}
                        >
                          {isPreviewCopied ? 'Copied' : 'Copy Coupon'}
                        </button>
                      </div>
                    )}

                    <button type="button" className="mt-4 h-12 px-8 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20">
                      {formData.buttonText || 'Claim Offer'}
                    </button>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-4 cursor-pointer hover:text-slate-600">
                      No thanks, close this window
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-[320px] bg-white rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-800 flex flex-col animate-in zoom-in-95 duration-300 relative h-[550px]">
                  <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 flex items-center justify-center rounded-b-xl w-32 mx-auto z-20" />
                  {previewMobileImage ? (
                    <div className="h-[240px] w-full bg-cover bg-center relative" style={{ backgroundImage: \`url('\${previewMobileImage}')\` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-[180px] w-full bg-slate-50 flex items-center justify-center border-b border-slate-100">
                      <ImageIcon className="text-slate-200" size={48} />
                    </div>
                  )}
                  <div className="p-6 text-center space-y-4 bg-white flex-1 flex flex-col justify-center relative">
                    {formData.popupType === 'COUPON' && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        {formData.discountPct ? \`\${formData.discountPct}% OFF\` : 'SPECIAL OFFER'}
                      </div>
                    )}
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {formData.title || 'Campaign Title'}
                    </h2>
                    {formData.subtitle && (
                      <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                        {formData.subtitle}
                      </p>
                    )}
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      {formData.description || 'Compelling description...'}
                    </p>

                    {formData.popupType === 'COUPON' && (
                      <div className="pt-2 pb-1 space-y-3">
                        <div className="relative flex items-center justify-center h-12 w-full border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-xl">
                          <span className="font-mono font-black tracking-widest text-emerald-800 text-lg">
                            {formData.couponCode || 'SAVE20'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handlePreviewCopy}
                          disabled={isPreviewCopied}
                          className={\`w-full h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all \${
                            isPreviewCopied 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }\`}
                        >
                          {isPreviewCopied ? 'Copied' : 'Copy Coupon'}
                        </button>
                      </div>
                    )}

                    <button type="button" className="w-full h-12 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 mt-auto">
                      {formData.buttonText || 'Claim Offer'}
                    </button>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                      Close
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* End of Top Split Layout */}

        {/* BOTTOM SECTION: Full Width Configs */}
        <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500 w-full">
          
          {/* Card: POPUP BUTTON ACTIONS */}
          <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Popup Button Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Button Text</label>
                <input
                  type="text"
                  placeholder="e.g. Claim Offer"
                  value={formData.buttonText}
                  onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Redirect To Page</label>
                <select
                  value={formData.redirectUrl}
                  onChange={e => setFormData({ ...formData, redirectUrl: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
                >
                  <option value="">No Redirect</option>
                  <option value="/products">All Products (/products)</option>
                  <option value="/categories">Categories (/categories)</option>
                  <option value="/cart">Cart (/cart)</option>
                </select>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Popup Action</label>
                <select
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
                >
                  <option value="NONE">None</option>
                  <option value="COPY_COUPON">Copy Coupon to Clipboard</option>
                  <option value="CLOSE">Close Popup</option>
                </select>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apply Coupon (Optional)</label>
                <select
                  value={formData.couponCode}
                  onChange={e => setFormData({ ...formData, couponCode: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
                >
                  <option value="">Select Coupon</option>
                  <option value="WELCOME10">WELCOME10</option>
                  <option value="SUMMER20">SUMMER20</option>
                </select>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount %</label>
                <input
                  type="text"
                  placeholder="e.g. 20"
                  value={formData.discountPct}
                  onChange={e => setFormData({ ...formData, discountPct: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Priority</label>
                <input
                  type="number"
                  min="0"
                  value={formData.priority || 0}
                  onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card: DISPLAY SETTINGS */}
          <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Display Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ToggleSwitch
                label="Show Once Per Session"
                description="Do not spam. Display only once until user closes tab/browser"
                checked={formData.oncePerSession}
                onChange={val => setFormData(prev => ({ ...prev, oncePerSession: val }))}
              />
              <ToggleSwitch
                label="Show Once Per User"
                description="Lifetime cap. Display only once per unique visitor"
                checked={formData.oncePerUser}
                onChange={val => setFormData(prev => ({ ...prev, oncePerUser: val }))}
              />
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Delay (Seconds)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.displayDelay || 0}
                  onChange={e => setFormData({ ...formData, displayDelay: parseInt(e.target.value) || 0 })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Auto Close Timer (Seconds)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={formData.autoCloseTimer || ''}
                  onChange={e => setFormData({ ...formData, autoCloseTimer: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card: CAMPAIGN IMAGES */}
          <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Campaign Images
            </h3>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-3 relative overflow-hidden text-left">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Uploader Guidelines</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] font-bold text-slate-500">
                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Desktop Size</p>
                  <p className="font-black text-slate-800">700 × 600 px</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Mobile Size</p>
                  <p className="font-black text-slate-800">400 × 600 px</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Format</p>
                  <p className="font-black text-slate-800">WEBP</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Max Size</p>
                  <p className="font-black text-slate-800">2 MB</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Desktop Image Upload */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Desktop Image (700 × 600 px)</span>
                <label className="relative flex flex-col items-center justify-center w-full aspect-[7/6] rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 transition-all cursor-pointer overflow-hidden group">
                  <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={e => handleImageUpload(e, 'desktop')} />
                  {formData.desktopImage ? (
                    <img src={formData.desktopImage} alt="Desktop Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-emerald-600 transition-colors">
                      {uploadingDesktop ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">Upload Desktop Image</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Mobile Image Upload */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Image (400 × 600 px)</span>
                <label className="relative flex flex-col items-center justify-center w-full aspect-[2/3] max-w-[280px] mx-auto rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 transition-all cursor-pointer overflow-hidden group">
                  <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={e => handleImageUpload(e, 'mobile')} />
                  {formData.mobileImage ? (
                    <img src={formData.mobileImage} alt="Mobile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-emerald-600 transition-colors">
                      {uploadingMobile ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">Upload Mobile Image</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Card: COUPON CONFIGURATION (Conditional) */}
          {formData.popupType === 'COUPON' && (
            <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
                Coupon Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coupon Selection</label>
                  <select
                    className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
                  >
                    <option value="EXISTING">Select Existing Coupon</option>
                    <option value="NEW">Create New Coupon</option>
                  </select>
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SAVE20"
                    value={formData.couponCode}
                    onChange={e => setFormData({ ...formData, couponCode: e.target.value })}
                    className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                    className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 20"
                    value={formData.discountPct}
                    onChange={e => setFormData({ ...formData, discountPct: e.target.value })}
                    className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coupon Start Date</label>
                  <input
                    type="datetime-local"
                    className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coupon Expiry Date</label>
                  <input
                    type="datetime-local"
                    value={formData.couponExpiry}
                    onChange={e => setFormData({ ...formData, couponExpiry: e.target.value })}
                    className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Card: SCHEDULING */}
          <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Scheduling
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card: DISPLAY RULES */}
            <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 space-y-5">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
                Display Rules (Pages)
              </h3>
              
              <SmartCheckbox label="All Pages" checked={formData.showOnAll} onChange={val => setFormData({ ...formData, showOnAll: val })} />
              <SmartCheckbox label="Homepage Only" checked={formData.showOnHome} onChange={val => setFormData({ ...formData, showOnHome: val })} />
              <SmartCheckbox label="Category Pages" checked={formData.showOnCategory} onChange={val => setFormData({ ...formData, showOnCategory: val })} />
              <SmartCheckbox label="Product Pages" checked={formData.showOnProduct} onChange={val => setFormData({ ...formData, showOnProduct: val })} />
              <SmartCheckbox label="Cart Page" checked={formData.showOnCart} onChange={val => setFormData({ ...formData, showOnCart: val })} />
              <SmartCheckbox label="Checkout Page" checked={formData.showOnCheckout} onChange={val => setFormData({ ...formData, showOnCheckout: val })} />
            </div>

            {/* Card: AUDIENCE TARGETING */}
            <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 space-y-5">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
                Audience Targeting
              </h3>
              
              <SmartCheckbox label="Guest Users" checked={formData.onlyGuest} onChange={val => setFormData({ ...formData, onlyGuest: val })} />
              <SmartCheckbox label="Logged-in Users" checked={formData.onlyLoggedIn} onChange={val => setFormData({ ...formData, onlyLoggedIn: val })} />
              <SmartCheckbox label="New Customers" checked={formData.targetNewCustomers} onChange={val => setFormData({ ...formData, targetNewCustomers: val })} />
              <SmartCheckbox label="Returning Customers" checked={formData.targetReturningCustomers} onChange={val => setFormData({ ...formData, targetReturningCustomers: val })} />
            </div>
          </div>

        </div>

        {/* Form Actions (Moved to bottom) */}
        <div className="flex items-center gap-4 justify-end pt-8 pb-4 border-t border-slate-200">
          <Link
            href="/admin/marketing/popup-campaigns"
            className="h-14 px-8 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Launch Campaign'}
          </button>
        </div>

      </form>
    </div>
`;

const newCode = beforeReturn + newReturnBlock + afterReturn;
fs.writeFileSync('src/app/admin/marketing/popup-campaigns/create/page.tsx', newCode);
console.log('Restructured entire page layouts successfully');
