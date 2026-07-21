const fs = require('fs');
const path = 'd:/Our Projects/Namma Orru foods/frontend/src/components/admin/CouponForm.tsx';
let content = fs.readFileSync(path, 'utf8');
// Replace all instances of dark:something
content = content.replace(/\bdark:[a-zA-Z0-9\/-]+\b/g, '');
// Cleangfdg up any double spaces left behind
content = content.replace(/  +/g, ' ');
fs.writeFileSync(path, content);
