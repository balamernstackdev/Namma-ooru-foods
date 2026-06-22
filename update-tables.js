const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

function ensureTableResponsiveness(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Update table classes to include min-w-[1000px] and whitespace-nowrap
  content = content.replace(/<table className="(.*?)"/g, (match, classes) => {
    let newClasses = classes;
    if (!newClasses.includes('min-w-')) {
      newClasses += ' min-w-[1000px]';
    }
    if (!newClasses.includes('whitespace-nowrap')) {
      newClasses += ' whitespace-nowrap';
    }
    return `<table className="${newClasses}"`;
  });

  // 2. Wrap tables in overflow-x-auto if not already wrapped
  // This uses a regex to find <table...> ... </table> and wraps it if it's not preceded by overflow-x-auto
  // Since regex on HTML is hard, we can instead add a generic class to all tables and handle it via CSS,
  // OR we just use a simple string replace for <table> tags.
  // Actually, many tables are already inside `<div className="overflow-x-auto">`.
  // Let's just do the class injection first.
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated classes in:', filePath);
  }
}

walk('d:/Our Projects/Namma Orru foods/frontend/src/app', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    ensureTableResponsiveness(filePath);
  }
});
