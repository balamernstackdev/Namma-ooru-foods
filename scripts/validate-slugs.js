const API_URL = "https://api.nammaorrufoods.com";

async function run() {
  console.log("\n=========================================");
  console.log("🚀 STARTING BUILD-TIME SLUG VALIDATION...");
  console.log("=========================================");

  let hasErrors = false;

  // 1. Validate Categories
  try {
    const res = await fetch(`${API_URL}/api/categories?limit=1000&all=true`);
    const data = await res.json();
    const categories = data.categories || [];
    console.log(`Auditing ${categories.length} Categories...`);
    categories.forEach(c => {
      if (!c.slug || c.slug.trim() === '') {
        console.error(`❌ Category ID ${c.id} ("${c.name}") has a missing or empty slug!`);
        hasErrors = true;
      }
    });
  } catch (err) {
    console.warn("⚠️ Failed to fetch categories for slug validation:", err.message);
  }

  // 2. Validate Subcategories
  try {
    const res = await fetch(`${API_URL}/api/subcategories?limit=1000`);
    const data = await res.json();
    const subcategories = data.subcategories || [];
    console.log(`Auditing ${subcategories.length} Subcategories...`);
    subcategories.forEach(s => {
      if (!s.slug || s.slug.trim() === '') {
        console.error(`❌ Subcategory ID ${s.id} ("${s.name}") has a missing or empty slug!`);
        hasErrors = true;
      }
    });
  } catch (err) {
    console.warn("⚠️ Failed to fetch subcategories for slug validation:", err.message);
  }

  // 3. Validate Brands
  try {
    const res = await fetch(`${API_URL}/api/sub-vendors?limit=1000&includeEmpty=true`);
    const data = await res.json();
    const brands = data.subVendors || [];
    console.log(`Auditing ${brands.length} Brands...`);
    brands.forEach(b => {
      if (!b.slug || b.slug.trim() === '') {
        console.error(`❌ Brand ID ${b.id} ("${b.name}") has a missing or empty slug!`);
        hasErrors = true;
      }
    });
  } catch (err) {
    console.warn("⚠️ Failed to fetch brands for slug validation:", err.message);
  }

  // 4. Validate Products
  try {
    const res = await fetch(`${API_URL}/api/products?limit=1000&status=all`);
    const data = await res.json();
    const products = Array.isArray(data) ? data : (data?.products || []);
    console.log(`Auditing ${products.length} Products...`);
    products.forEach(p => {
      if (!p.slug || p.slug.trim() === '') {
        console.error(`❌ Product ID ${p.id} ("${p.name}") has a missing or empty slug!`);
        hasErrors = true;
      }
    });
  } catch (err) {
    console.warn("⚠️ Failed to fetch products for slug validation:", err.message);
  }

  console.log("=========================================");
  if (hasErrors) {
    console.warn("⚠️ SLUG VALIDATION COMPLETED WITH WARNINGS/ERRORS. Please resolve missing slugs in the admin panel to prevent broken links.");
  } else {
    console.log("✅ ALL SLUGS VALIDATED SUCCESSFULLY!");
  }
  console.log("=========================================");
}

run();
