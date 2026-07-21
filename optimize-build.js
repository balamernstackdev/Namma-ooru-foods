const fs = require('fs');
const path = require('path');
const glob = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const appDir = path.join(__dirname, 'src/app');
let modifiedCount = 0;

walkDir(appDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('generateStaticParams')) {
      // Replace Array.from({ length: ... }) or similar large dummy arrays with []
      const newContent = content.replace(
        /return\s+Array\.from\(\{\s*length:\s*\d+\s*\},[\s\S]*?\);/g,
        'return [];'
      );

      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Fixed generateStaticParams in: ${path.relative(__dirname, filePath)}`);
        modifiedCount++;
      }
    }
  }
});

console.log(`\n🎉 Total files optimized: ${modifiedCount}`);
