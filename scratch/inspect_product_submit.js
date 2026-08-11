const fs = require('fs');
const content = fs.readFileSync('src/app/admin/products/page.tsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('Status:') || line.includes('status ===') || line.includes('status:')) {
    console.log(`${i+1}: ${line.trim()}`);
  }
});
