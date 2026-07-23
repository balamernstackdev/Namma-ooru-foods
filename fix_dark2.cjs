const fs = require('fs');
const path = 'd:/Our Projects/Namma Orru foods/frontend/src/components/admin/CouponForm.tsx';
let content = fs.readFileSync(path, 'utf8');
// Fix leftover artifacts from previous bad regex like :bg-slate-700 or hover:bg-slate-800
content = content.replace(/\s+:\S+/g, '');
content = content.replace(/\s+hover:\S+/g, (match) => {
    // only remove sssif it's the second hover, or we can just leave it if it works
    return match;
});
fs.writeFileSync(path, content);
