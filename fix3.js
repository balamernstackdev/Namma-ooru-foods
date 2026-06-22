const fs = require('fs');
let code = fs.readFileSync('src/app/admin/marketing/popup-campaigns/create/page.tsx', 'utf8');

const replacement = `// --- Custom Checkbox Component ---
const SmartCheckbox = ({ checked, onChange, label }: { checked: boolean; onChange: (val: boolean) => void; label: string }) => {
  return (
    <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors bg-white">
      <div className={\`flex items-center justify-center w-6 h-6 rounded-lg border transition-all \${checked ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}\`}>
        {checked && <Check size={14} className="text-white" />}
      </div>
      <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{label}</span>
      <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  );
};`;

code = code.replace(/\/\/-+\s*Custom Checkbox Component\s*-+[\s\S]*?}\) => {\s*const ToggleSwitch/m, replacement + '\n\nconst ToggleSwitch');
fs.writeFileSync('src/app/admin/marketing/popup-campaigns/create/page.tsx', code);
console.log('Fixed SmartCheckbox missing body');
