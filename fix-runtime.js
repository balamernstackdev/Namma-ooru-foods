const fs = require('fs');

const missingFunctions = `
  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'desktop') setUploadingDesktop(true);
    else setUploadingMobile(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('namma_orru_token');
      const res = await fetch(\`\${API_URL}/api/upload\`, {
        method: 'POST',
        headers: {
          Authorization: \`Bearer \${token}\`
        },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      
      if (type === 'desktop') {
        setFormData(prev => ({ ...prev, desktopImage: data.imageUrl }));
      } else {
        setFormData(prev => ({ ...prev, mobileImage: data.imageUrl }));
      }
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      if (type === 'desktop') setUploadingDesktop(false);
      else setUploadingMobile(false);
    }
  };

  const handlePreviewCopy = () => {
    navigator.clipboard.writeText(formData.couponCode || 'SAVE20');
    setIsPreviewCopied(true);
    setTimeout(() => setIsPreviewCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('namma_orru_token');
      const res = await fetch(\`\${API_URL}/api/admin/popups\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify({
          ...formData,
          priority: parseInt(formData.priority?.toString()) || 0,
          displayDelay: parseInt(formData.displayDelay?.toString()) || 0
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create campaign');
      
      toast.success('Campaign created successfully!');
      router.push('/admin/marketing/popup-campaigns');
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };
`;

const startCode = `export default function CreatePopupCampaignPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  
  const [statusMode, setStatusMode] = useState('active');
  const [redirectType, setRedirectType] = useState('none');
  const [externalUrl, setExternalUrl] = useState('');
  const [popupActionType, setPopupActionType] = useState('none');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isPreviewCopied, setIsPreviewCopied] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    desktopImage: '',
    mobileImage: '',
    buttonText: 'Claim Offer',
    redirectUrl: '',
    couponCode: '',
    discountPct: '',
    popupType: 'NEWSLETTER',
    displayDelay: 3,
    oncePerSession: true,
    oncePerUser: false,
    onlyGuest: false,
    onlyLoggedIn: false,
    targetNewCustomers: false,
    targetReturningCustomers: false,
    showOnAll: true,
    showOnHome: false,
    showOnCategory: false,
    showOnProduct: false,
    showOnCart: false,
    showOnCheckout: false,
    startDate: '',
    endDate: '',
    couponExpiry: '',
    discountType: 'PERCENTAGE',
    copySuccessMsg: 'Coupon copied!',
    showCouponCode: true,
    autoCopy: false,
    exitIntent: false,
    autoCloseTimer: '',
    status: 'active',
    priority: 0,
    isActive: true
  });

  const previewDesktopImage = formData.desktopImage;
  const previewMobileImage = formData.mobileImage;

` + missingFunctions;

let code = fs.readFileSync('src/app/admin/marketing/popup-campaigns/create/page.tsx', 'utf8');

const fallbackPos = code.indexOf('    <div className="space-y-8 animate-in fade-in duration-500 pb-16">');
if (fallbackPos !== -1) {
  const startOfReturn = code.lastIndexOf('  return (', fallbackPos);
  
  // check if SmartCheckbox definition is missing entirely. If so, let's inject it above export default.
  let smartCheckboxStr = `const SmartCheckbox = ({ checked, onChange, label }: { checked: boolean; onChange: (val: boolean) => void; label: string }) => {
  return (
    <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors bg-white">
      <div className={\`flex items-center justify-center w-6 h-6 rounded-lg border transition-all \${checked ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}\`}>
        {checked && <Check size={14} className="text-white" />}
      </div>
      <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{label}</span>
      <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  );
};
`;

  const ToggleSwitchStr = `const ToggleSwitch = ({ label, description, checked, onChange }: any) => {
  return (
    <div className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-white">
      <div className="space-y-1 pr-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block">{label}</label>
        {description && <p className="text-xs font-medium text-slate-500">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
      </label>
    </div>
  );
};
`;

  let prefix = '';
  if (!code.includes('const SmartCheckbox =')) {
    prefix += smartCheckboxStr + '\n';
  }
  if (!code.includes('const ToggleSwitch =')) {
    prefix += ToggleSwitchStr + '\n';
  }

  // We are wiping from the first 'return (' we found until fallbackPos basically. Wait.
  // Actually, we wipe from whatever was before 'return (' to the startOfReturn.
  // Wait, let's just replace from 'import ...' down to startOfReturn with our prefix + startCode + '  return ('
  
  // Find where imports end
  const importEnd = code.lastIndexOf('import ');
  const endOfImports = code.indexOf('\\n', importEnd) + 1; // approximate
  
  // Just wipe from the end of the first few lines and completely replace.
  // It's safer to just split by fallbackPos.
  const modifiedCode = code.substring(0, startOfReturn) + '\\n\\n' + prefix + startCode + code.substring(startOfReturn);
  
  // Remove duplicate SmartCheckbox if there was a broken one.
  // Actually, I'll just write it.
  fs.writeFileSync('src/app/admin/marketing/popup-campaigns/create/page.tsx', modifiedCode);
  console.log('Successfully injected using fallback');
} else {
  console.log('Could not find injection point');
}
