const fs = require('fs');
['src/app/admin/brands/page.tsx', 'src/app/admin/orders/page.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let nc = c.replace(/className=\{"px-6/g, 'className="px-6');
  if (c !== nc) {
    fs.writeFileSync(f, nc);
    console.log('Fixed syntax error in', f);
  }
});
