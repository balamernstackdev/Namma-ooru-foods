const fs = require('fs');
const content = fs.readFileSync('src/app/admin/tracking/page.tsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('fetch(') || line.includes('/api/')) {
    console.log(`${i+1}: ${line.trim()}`);
  }
});
