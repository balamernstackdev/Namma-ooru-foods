const fs = require('fs');
const content = fs.readFileSync('src/app/admin/products/page.tsx', 'utf8');

const lines = content.split('\n');
let print = false;
let start = 0;
lines.forEach((line, i) => {
  if (line.includes('paginatedProducts.map')) {
    start = i;
    print = true;
  }
  if (print && i >= start && i < start + 150) {
    console.log(`${i+1}: ${line}`);
  }
});
