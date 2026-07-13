# Next.js Deployment Verification Report (Static Export)

This report validates the static production build structure, folder hierarchy, and output format for Hostinger deployment.

## Summary

| Metric | Status / Value |
| --- | --- |
| **Next.js Version** | 16.2.2 |
| **Build Mode** | production export |
| **Output Mode** | static export (CORRECT) |
| **Folder Structure Validation** | Invalid |

## Directories Verification

* **out/_next/static/chunks**: ❌ MISSING
* **out/index.html**: ❌ MISSING

### Missing Directories
* `out`


## Errors / Warnings

* out directory does not exist. Please run next build first.

## Deployment Recommendations

1. Folder for "admin" does not exist in out/. Verify if build successfully pre-rendered pages.
2. Folder for "vendor" does not exist in out/. Verify if build successfully pre-rendered pages.
3. Folder for "categories" does not exist in out/. Verify if build successfully pre-rendered pages.
4. Folder for "products" does not exist in out/. Verify if build successfully pre-rendered pages.
5. Folder for "brands" does not exist in out/. Verify if build successfully pre-rendered pages.
6. Folder for "blog" does not exist in out/. Verify if build successfully pre-rendered pages.
7. Deploy this build using out.zip, which contains the nested static files structure with forward slash separators.
8. Upload out.zip to Hostinger and extract it directly inside public_html or your target subdomain directory.

---
*Report generated on 2026-07-13T11:32:52.191Z*
