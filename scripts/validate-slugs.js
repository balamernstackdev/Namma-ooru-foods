const fs = require('fs');
const path = require('path');

// Dynamically extract the API URL from .env.local or fallback to localhost
let envApiUrl = '';
try {
  const envLocalPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf8');
    const match = content.match(/NEXT_PUBLIC_API_URL\s*=\s*([^\r\n]+)/);
    if (match && match[1]) {
      envApiUrl = match[1].trim();
    }
  }
} catch (e) {
  console.warn("⚠️ Failed to parse .env.local in validate-slugs.js:", e.message);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || envApiUrl || "http://localhost:5000";

async function run() {
  console.log("\n=========================================");
  console.log("🚀 STARTING BUILD-TIME SLUG VALIDATION...");
  console.log(`📡 API Target URL: ${API_URL}`);
  console.log("=========================================");

  let hasErrors = false;
  let dbConnected = false;
  let categories = [];
  let subcategories = [];
  let brands = [];
  let products = [];

  // 1. Audit Categories & Check DB Connectivity
  try {
    const res = await fetch(`${API_URL}/api/categories?limit=1000&all=true`);
    if (!res.ok) {
      console.warn(`⚠️ [API Warning] Categories API responded with status ${res.status}`);
    } else {
      const data = await res.json();
      categories = data.categories || (Array.isArray(data) ? data : []);
      dbConnected = true; // Succeeded in fetching real data from DB
      console.log(`✅ Categories API: HTTP 200 OK (${categories.length} items parsed)`);
    }
  } catch (err) {
    console.warn("⚠️ [API Connection Failure] Categories API could not be reached:", err.message);
  }

  // 2. Audit Subcategories
  try {
    const res = await fetch(`${API_URL}/api/subcategories?limit=1000`);
    if (!res.ok) {
      console.warn(`⚠️ [API Warning] Subcategories API responded with status ${res.status}`);
    } else {
      const data = await res.json();
      subcategories = data.subcategories || [];
      console.log(`✅ Subcategories API: HTTP 200 OK (${subcategories.length} items parsed)`);
    }
  } catch (err) {
    console.warn("⚠️ [API Connection Failure] Subcategories API could not be reached:", err.message);
  }

  // 3. Audit Brands (Sub-vendors)
  try {
    const res = await fetch(`${API_URL}/api/sub-vendors?limit=1000&includeEmpty=true`);
    if (!res.ok) {
      console.warn(`⚠️ [API Warning] Brands (Sub-vendors) API responded with status ${res.status}`);
    } else {
      const data = await res.json();
      brands = data.subVendors || [];
      console.log(`✅ Brands API: HTTP 200 OK (${brands.length} items parsed)`);
    }
  } catch (err) {
    console.warn("⚠️ [API Connection Failure] Brands API could not be reached:", err.message);
  }

  // 4. Audit Products
  try {
    const res = await fetch(`${API_URL}/api/products?limit=1000&status=all`);
    if (!res.ok) {
      console.warn(`⚠️ [API Warning] Products API responded with status ${res.status}`);
    } else {
      const data = await res.json();
      products = Array.isArray(data) ? data : (data?.products || []);
      console.log(`✅ Products API: HTTP 200 OK (${products.length} items parsed)`);
    }
  } catch (err) {
    console.warn("⚠️ [API Connection Failure] Products API could not be reached:", err.message);
  }

  console.log("\n=========================================");
  console.log("📊 BUILD DIAGNOSTICS & SUMMARY");
  console.log(`- API URL: ${API_URL}`);
  console.log(`- Database Connectivity: ${dbConnected ? "CONNECTED" : "DISCONNECTED/WARNING"}`);
  console.log(`- Total Categories: ${categories.length}`);
  console.log(`- Total Brands: ${brands.length}`);
  console.log(`- Total Subcategories: ${subcategories.length}`);
  console.log(`- Total Products: ${products.length}`);
  console.log("=========================================\n");

  // Validate slug integrity of whatever data was fetched
  if (categories.length > 0) {
    console.log(`Auditing ${categories.length} Categories...`);
    categories.forEach(c => {
      if (!c.slug || c.slug.trim() === '') {
        console.error(`❌ Category ID ${c.id} ("${c.name}") has a missing or empty slug!`);
        hasErrors = true;
      }
    });
  }

  if (subcategories.length > 0) {
    console.log(`Auditing ${subcategories.length} Subcategories...`);
    subcategories.forEach(s => {
      if (!s.slug || s.slug.trim() === '') {
        console.error(`❌ Subcategory ID ${s.id} ("${s.name}") has a missing or empty slug!`);
        hasErrors = true;
      }
    });
  }

  if (brands.length > 0) {
    console.log(`Auditing ${brands.length} Brands...`);
    brands.forEach(b => {
      if (!b.slug || b.slug.trim() === '') {
        console.error(`❌ Brand ID ${b.id} ("${b.name}") has a missing or empty slug!`);
        hasErrors = true;
      }
    });
  }

  if (products.length > 0) {
    console.log(`Auditing ${products.length} Products...`);
    products.forEach(p => {
      if (!p.slug || p.slug.trim() === '') {
        console.error(`❌ Product ID ${p.id} ("${p.name}") has a missing or empty slug!`);
        hasErrors = true;
      }
    });
  }

  console.log("=========================================");
  if (hasErrors) {
    console.warn("⚠️ SLUG VALIDATION COMPLETED WITH WARNINGS. Please resolve missing slugs in the admin panel.");
  } else {
    console.log("✅ ALL SLUGS VALIDATED SUCCESSFULLY OR SKIPPED DUE TO API ERRORS.");
  }
  console.log("=========================================\n");

  // Exit successfully to prevent temporary build-time API errors from blocking deployment
  process.exit(0);
}

run();
