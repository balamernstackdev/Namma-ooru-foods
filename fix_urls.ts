import fs from 'fs';
import path from 'path';

const frontendDir = 'd:/Our Projects/namma ooru foods/frontend/src';
const oldUrl = 'https://api-backend-nammaorru-foods.onrender.com';

function walk(dir: string, callback: (filePath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      walk(filePath, callback);
    } else if (stats.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      callback(filePath);
    }
  }
}

walk(frontendDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes(oldUrl)) {
    console.log(`Fixing ${filePath}`);

    // Replace URL
    content = content.replace(new RegExp(oldUrl, 'g'), '${API_URL}');

    // Ensure import is present if not already there
    if (!content.includes("from '@/lib/api'")) {
      // Add import after other imports or at top
      const lines = content.split('\n');
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      lines.splice(lastImportIndex + 1, 0, "import { API_URL } from '@/lib/api';");
      content = lines.join('\n');
    }

    // If we used ${API_URL} but it wasn't a template literal, we might need to fix it.
    // Actually, most replacements were in strings.
    // 'https://...' -> '${API_URL}'
    // We need to change the surrounding quotes to backticks if they are single or double quotes.
    content = content.replace(/['"]\$\{API_URL\}([^'"]*)['"]/g, '`${API_URL}$1`');

    fs.writeFileSync(filePath, content);
  }
});
