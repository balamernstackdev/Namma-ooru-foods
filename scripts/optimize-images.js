const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadsDir = path.join(__dirname, '../public/uploads');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created directory: ${uploadsDir}`);
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    const filename = path.basename(filePath, ext);
    const newPath = path.join(path.dirname(filePath), `${filename}.webp`);
    
    // Determine target size based on filename or just optimize
    let width = 800; // default for product images
    let height = 800;

    if (filename.includes('hero')) {
      width = 1920; height = 700;
    } else if (filename.includes('category')) {
      width = 1200; height = 300;
    } else if (filename.includes('thumb')) {
      width = 300; height = 300;
    }

    try {
      await sharp(filePath)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 }) // 80 quality usually keeps it under 200KB
        .toFile(newPath);
      
      console.log(`Optimized: ${newPath}`);
      
      // Optionally delete the original
      // fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err);
    }
  }
}

async function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await processDirectory(fullPath);
    } else {
      await optimizeImage(fullPath);
    }
  }
}

console.log('Starting image optimization...');
processDirectory(uploadsDir).then(() => {
  console.log('Image optimization complete.');
});
