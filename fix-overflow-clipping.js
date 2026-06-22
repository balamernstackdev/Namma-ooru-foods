const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      
      // Look for the table wrapper which has overflow-x-auto
      let nc = c.replace(/className="([^"]*overflow-x-auto[^"]*)"/g, (match, cls) => {
        if (!cls.includes('min-h-') && (cls.includes('hidden') || cls.includes('md:block'))) {
          // It's the wrapper div for the table
          return `className="${cls} min-h-[280px]"`;
        }
        return match;
      });
      
      if (c !== nc) {
        fs.writeFileSync(p, nc);
        console.log('Added min-h to', p);
      }
    }
  });
}
walk('src/app/admin');
walk('src/app/vendor');
