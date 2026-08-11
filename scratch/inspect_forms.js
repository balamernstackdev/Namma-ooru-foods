const fs = require('fs');

function inspectFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`=== INSPECTING ${filePath} ===`);
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.toLowerCase().includes('status') || line.toLowerCase().includes('active') || line.toLowerCase().includes('disable') || line.toLowerCase().includes('enable')) {
      console.log(`${i+1}: ${line.trim()}`);
    }
  });
}

inspectFile('src/components/admin/CategoryForm.tsx');
inspectFile('src/components/admin/SubcategoryForm.tsx');
inspectFile('src/components/admin/ProductForm.tsx');
