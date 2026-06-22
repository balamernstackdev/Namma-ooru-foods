const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'src', 'app');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function stripGenerateStaticParams(content) {
  // Find "export function generateStaticParams" or "export async function generateStaticParams"
  // Allow spaces, returns types, etc.
  const regex = /export\s+(async\s+)?function\s+generateStaticParams/g;
  const match = regex.exec(content);
  if (!match) return content;

  const startIndex = match.index;
  let braceCount = 0;
  let started = false;
  let endIndex = -1;

  // Let's scan character by character to find the matching closing brace
  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];

    // Handle comments
    if (char === '/' && content[i + 1] === '/') {
      while (i < content.length && content[i] !== '\n') i++;
      continue;
    }
    if (char === '/' && content[i + 1] === '*') {
      i += 2;
      while (i < content.length && !(content[i] === '*' && content[i + 1] === '/')) i++;
      i++;
      continue;
    }

    // Handle string literals to avoid counting braces inside them
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      i++;
      while (i < content.length) {
        if (content[i] === '\\') {
          i += 2;
          continue;
        }
        if (content[i] === quote) {
          break;
        }
        i++;
      }
      continue;
    }

    if (char === '{') {
      braceCount++;
      started = true;
    } else if (char === '}') {
      braceCount--;
      if (started && braceCount === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex !== -1) {
    // Remove the function block
    return content.slice(0, startIndex) + content.slice(endIndex + 1);
  }

  return content;
}

function modifyPage(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('generateStaticParams')) {
    return false;
  }

  console.log(`Processing: ${path.relative(path.join(APP_DIR, '..'), filePath)}`);

  // 1. Strip generateStaticParams function
  content = stripGenerateStaticParams(content);

  // 2. Clean up any existing or commented-out configuration variables
  content = content.replace(/\/\/\s*export\s+const\s+dynamicParams\s*=\s*\w+;?/g, '');
  content = content.replace(/export\s+const\s+dynamicParams\s*=\s*\w+;?/g, '');
  content = content.replace(/\/\/\s*export\s+const\s+dynamic\s*=\s*['"]\w+['"];?/g, '');
  content = content.replace(/export\s+const\s+dynamic\s*=\s*['"]\w+['"];?/g, '');
  content = content.replace(/\/\/\s*export\s+const\s+revalidate\s*=\s*\d+;?/g, '');
  content = content.replace(/export\s+const\s+revalidate\s*=\s*\d+;?/g, '');

  // 3. Prepend new force-dynamic configuration
  const configHeader = `export const dynamic = "force-dynamic";\nexport const dynamicParams = true;\nexport const revalidate = 0;\n\n`;
  content = configHeader + content;

  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

function main() {
  console.log('Scanning for dynamic pages under src/app...');
  const files = getAllFiles(APP_DIR).filter(file => file.endsWith('page.tsx'));
  let modifiedCount = 0;

  files.forEach(file => {
    if (modifyPage(file)) {
      modifiedCount++;
    }
  });

  console.log(`\nFinished refactoring dynamic pages. Modified ${modifiedCount} files.`);
}

main();
