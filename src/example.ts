import { FileScanner } from './services/scanner/fileScanner';
import path from 'path';

async function scanDirectory(dirPath: string) {
  try {
    console.log(`Scanning directory: ${dirPath}`);
    const scanner = new FileScanner(dirPath);
    
    const images = await scanner.scan({
      recursive: true,
      fileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      maxSize: 10 * 1024 * 1024 // 10MB max
    });

    console.log('\nFound images:');
    images.forEach((img, index) => {
      console.log(`\n[${index + 1}] ${img.path}`);
      console.log(`  Size: ${(img.size / 1024).toFixed(2)} KB`);
      console.log(`  Hash: ${img.hash}`);
      console.log(`  Created: ${img.created.toISOString()}`);
      if (img.dimensions) {
        console.log(`  Dimensions: ${img.dimensions.width}x${img.dimensions.height}`);
      }
    });

    console.log(`\nTotal images found: ${images.length}`);
    return images;
  } catch (error) {
    console.error('Error scanning directory:', error);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  const targetDir = process.argv[2] || '.';
  scanDirectory(path.resolve(targetDir))
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export { scanDirectory };
