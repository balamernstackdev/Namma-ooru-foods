const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Use TS Compiler API to find and remove generateStaticParams
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  let generateStaticParamsNode = null;
  
  ts.forEachChild(sourceFile, node => {
    if (ts.isFunctionDeclaration(node)) {
      if (node.name && node.name.text === 'generateStaticParams') {
        generateStaticParamsNode = node;
      }
    }
  });

  if (generateStaticParamsNode) {
    // Remove the node
    const start = generateStaticParamsNode.getStart(sourceFile);
    const end = generateStaticParamsNode.getEnd();
    content = content.substring(0, start) + content.substring(end);
  }

  // Also strip existing dynamic exports
  content = content.replace(/\/\/\s*export\s+const\s+dynamicParams\s*=\s*(?:true|false);\n?/g, '');
  content = content.replace(/export\s+const\s+dynamicParams\s*=\s*(?:true|false);\n?/g, '');
  content = content.replace(/export\s+const\s+dynamic\s*=\s*['"](?:force-dynamic|error|force-static|auto)['"];\n?/g, '');
  content = content.replace(/export\s+const\s+revalidate\s*=\s*\d+;\n?/g, '');

  const ssrExports = `\nexport const dynamic = "force-dynamic";\nexport const dynamicParams = true;\nexport const revalidate = 0;\n`;
  
  const importRegex = /^import\s+.*from\s+['"].*['"];?$/gm;
  let lastImportIndex = 0;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    lastImportIndex = match.index + match[0].length;
  }

  if (lastImportIndex === 0) {
    content = ssrExports + '\n' + content;
  } else {
    content = content.substring(0, lastImportIndex) + '\n' + ssrExports + content.substring(lastImportIndex);
  }

  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Refactored:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      if (fullPath.includes('[') && fullPath.includes(']') && fullPath.endsWith('page.tsx')) {
        processFile(fullPath);
      }
    }
  }
}

const appDir = path.resolve('d:/Our Projects/Namma Orru foods/frontend/src/app');
walkDir(appDir);
console.log('Done!');
