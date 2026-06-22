const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

function updateTableClasses(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove whitespace-nowrap and change min-w-[1000px] to min-w-[1200px] admin-data-table
  content = content.replace(/<table className="(.*?)"/g, (match, classes) => {
    let newClasses = classes.replace(/\bwhitespace-nowrap\b/g, '').replace(/\bmin-w-\[1000px\]\b/g, '').trim();
    if (!newClasses.includes('min-w-[1200px]')) {
      newClasses += ' min-w-[1200px] admin-data-table';
    }
    // Clean up multiple spaces
    newClasses = newClasses.replace(/\s+/g, ' ');
    return `<table className="${newClasses}"`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed table classes in:', filePath);
  }
}

walk('d:/Our Projects/Namma Orru foods/frontend/src/app', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    updateTableClasses(filePath);
  }
});
