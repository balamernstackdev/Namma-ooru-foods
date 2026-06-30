const fs = require('fs');
const path = require('path');

async function validateBuild() {
  const manifestPath = path.join(process.cwd(), '.next', 'prerender-manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Build validation failed: prerender-manifest.json not found. Did you run `npm run build`?');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const routes = manifest.routes || {};

  const categories = Object.keys(routes).filter(r => r.startsWith('/categories/'));
  const subcategories = Object.keys(routes).filter(r => r.startsWith('/subcategories/'));
  const brands = Object.keys(routes).filter(r => r.startsWith('/brands/'));
  const vendors = Object.keys(routes).filter(r => r.startsWith('/vendors/'));
  const products = Object.keys(routes).filter(r => r.startsWith('/products/'));

  console.log('\n======================================================');
  console.log('✅ BUILD VALIDATION REPORT: PRE-RENDERED DYNAMIC PAGES');
  console.log('======================================================');
  console.log(`- Categories:    ${categories.length} paths pre-rendered.`);
  console.log(`- Subcategories: ${subcategories.length} paths pre-rendered.`);
  console.log(`- Brands:        ${brands.length} paths pre-rendered.`);
  console.log(`- Vendors:       ${vendors.length} paths pre-rendered.`);
  console.log(`- Products:      ${products.length} paths pre-rendered.`);
  console.log('======================================================');

  if (categories.length === 0 && subcategories.length === 0 && products.length === 0) {
    console.warn('⚠️  Warning: Very few or zero dynamic pages were pre-rendered.');
    console.warn('⚠️  Ensure your backend API is accessible during the build phase.');
    console.warn('⚠️  (Pages will still SSR on-demand for users thanks to dynamicParams=true).');
  } else {
    console.log('✨ Build looks healthy! Newly added items will be rendered on-demand automatically.');
  }
}

validateBuild();
