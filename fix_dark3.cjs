const fs = require('fs');
const path = 'd:/Our Projects/Namma Orru foods/frontend/src/components/admin/CouponForm.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/\bdark:[^\s"']+/g, '');
content = content.replace(/  +/g, ' ');
fs.writeFileSync(path, content);
