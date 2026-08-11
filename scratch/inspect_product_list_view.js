const fs = require('fs');
const content = fs.readFileSync('src/app/admin/products/page.tsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('paginatedProducts.map') || line.includes('<table')) {
    console.log(`line ${i+1}: ${line}`);
  }
});
