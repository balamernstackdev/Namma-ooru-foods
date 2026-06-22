const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'out');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const NEXT_CONFIG_PATH = path.join(ROOT_DIR, 'next.config.ts');

function checkDirectoryExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function checkFileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function scanForBackslashFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    if (file.includes('\\')) {
      fileList.push(path.join(dir, file));
    }
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanForBackslashFiles(fullPath, fileList);
    }
  });

  return fileList;
}

function main() {
  console.log('Running static build and deployment verification...\n');

  const reportData = {
    nextVersion: 'Unknown',
    buildMode: 'production export',
    outputMode: 'static export',
    dynamicRoutingStatus: 'Static Pre-rendered',
    folderStructureValidation: 'Valid',
    missingDirectories: [],
    errors: [],
    recommendations: []
  };

  // 1. Get Next.js version
  if (fs.existsSync(PACKAGE_JSON_PATH)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
      reportData.nextVersion = packageJson.dependencies?.next || 'Unknown';
    } catch (e) {
      reportData.errors.push(`Failed to read package.json: ${e.message}`);
    }
  } else {
    reportData.errors.push('package.json not found.');
  }

  // 2. Output mode validation
  if (fs.existsSync(NEXT_CONFIG_PATH)) {
    try {
      const configContent = fs.readFileSync(NEXT_CONFIG_PATH, 'utf8');
      if (configContent.includes("output: 'export'") || configContent.includes('output: "export"')) {
        reportData.outputMode = 'static export (CORRECT)';
      } else {
        reportData.outputMode = 'standalone / server (INCORRECT)';
        reportData.errors.push('next.config.ts should specify output: "export" for static hosting.');
      }
    } catch (e) {
      reportData.errors.push(`Failed to read next.config.ts: ${e.message}`);
    }
  }

  // 3. Verify out directory structure
  if (!checkDirectoryExists(OUT_DIR)) {
    reportData.folderStructureValidation = 'Invalid';
    reportData.missingDirectories.push('out');
    reportData.errors.push('out directory does not exist. Please run next build first.');
  } else {
    // Check index.html
    const indexHtmlPath = path.join(OUT_DIR, 'index.html');
    if (!checkFileExists(indexHtmlPath)) {
      reportData.errors.push('index.html is missing in out/ directory.');
    }

    // Check _next/static/chunks directory
    const chunksDir = path.join(OUT_DIR, '_next', 'static', 'chunks');
    if (!checkDirectoryExists(chunksDir)) {
      reportData.missingDirectories.push('out/_next/static/chunks');
      reportData.errors.push('out/_next/static/chunks directory is missing.');
    } else {
      // Check if nested chunks folders are preserved (e.g. app/admin, app/vendor)
      const appChunksDir = path.join(chunksDir, 'app');
      if (checkDirectoryExists(appChunksDir)) {
        const nestedDirs = ['admin', 'vendor', 'products', 'categories'];
        nestedDirs.forEach(sub => {
          const subPath = path.join(appChunksDir, sub);
          if (!checkDirectoryExists(subPath)) {
            reportData.recommendations.push(`Chunk subfolder for "${sub}" not found in chunks folder.`);
          }
        });
      }
    }
  }

  // 4. Scan for flattened backslash filenames in the output
  const backslashFiles = scanForBackslashFiles(OUT_DIR);
  if (backslashFiles.length > 0) {
    reportData.folderStructureValidation = 'Invalid (Flattened Backslashes Detected)';
    reportData.errors.push(`Detected ${backslashFiles.length} file name(s) containing backslash path separators. Path flattening issues detected!`);
    backslashFiles.forEach(file => {
      reportData.errors.push(`  - Flattened file: ${path.relative(ROOT_DIR, file)}`);
    });
  }

  // 5. Check dynamic routes inside out folder
  const nestedFolders = ['admin', 'vendor', 'categories', 'products', 'brands', 'blog'];
  nestedFolders.forEach(folder => {
    const folderPath = path.join(OUT_DIR, folder);
    if (!checkDirectoryExists(folderPath)) {
      reportData.recommendations.push(`Folder for "${folder}" does not exist in out/. Verify if build successfully pre-rendered pages.`);
    }
  });

  reportData.recommendations.push('Deploy this build using out.zip, which contains the nested static files structure with forward slash separators.');
  reportData.recommendations.push('Upload out.zip to Hostinger and extract it directly inside public_html or your target subdomain directory.');

  // 6. Write Report to markdown file
  const reportPath = path.join(ROOT_DIR, 'deployment_report.md');
  let mdReport = `# Next.js Deployment Verification Report (Static Export)

This report validates the static production build structure, folder hierarchy, and output format for Hostinger deployment.

## Summary

| Metric | Status / Value |
| --- | --- |
| **Next.js Version** | ${reportData.nextVersion} |
| **Build Mode** | ${reportData.buildMode} |
| **Output Mode** | ${reportData.outputMode} |
| **Folder Structure Validation** | ${reportData.folderStructureValidation} |

## Directories Verification

* **out/_next/static/chunks**: ${checkDirectoryExists(path.join(OUT_DIR, '_next', 'static', 'chunks')) ? '✅ EXISTS' : '❌ MISSING'}
* **out/index.html**: ${checkFileExists(path.join(OUT_DIR, 'index.html')) ? '✅ EXISTS' : '❌ MISSING'}

${reportData.missingDirectories.length > 0 ? `### Missing Directories\n${reportData.missingDirectories.map(d => `* \`${d}\``).join('\n')}\n` : ''}

## Errors / Warnings

${reportData.errors.length === 0 ? '✅ No path flattening, folder structure, or configuration errors detected!' : reportData.errors.map(err => `* ${err}`).join('\n')}

## Deployment Recommendations

${reportData.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
*Report generated on ${new Date().toISOString()}*
`;

  fs.writeFileSync(reportPath, mdReport, 'utf8');
  console.log(mdReport);
  console.log(`Deployment report successfully written to ${reportPath}`);
}

main();
