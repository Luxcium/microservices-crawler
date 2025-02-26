import axios from 'axios';

/**
 * Example showing how to integrate with the image crawler service
 */
async function scanImages(path: string) {
  const API_URL = 'http://localhost:3000/api';

  try {
    // First validate the path
    const validateResponse = await axios.post(`${API_URL}/validate`, { path });
    const { valid, reason } = validateResponse.data;

    if (!valid) {
      console.error(`Invalid path: ${reason}`);
      return;
    }

    // Scan for images
    const scanResponse = await axios.post(`${API_URL}/scan`, {
      path,
      options: {
        recursive: true,
        fileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        maxSize: 10 * 1024 * 1024 // 10MB
      }
    });

    const { images, totalFiles } = scanResponse.data;

    console.log(`\nFound ${totalFiles} images:\n`);
    images.forEach((img: any) => {
      console.log(`File: ${img.path}`);
      console.log(`Size: ${(img.size / 1024).toFixed(2)} KB`);
      console.log(`Hash: ${img.hash}`);
      if (img.dimensions) {
        console.log(`Dimensions: ${img.dimensions.width}x${img.dimensions.height}`);
      }
      console.log('---');
    });

    return images;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error scanning images:', error.response?.data || error.message);
    } else {
      console.error('Error:', error);
    }
    throw error;
  }
}

// Example usage
if (require.main === module) {
  const targetPath = process.argv[2];
  if (!targetPath) {
    console.error('Please provide a path to scan');
    process.exit(1);
  }

  scanImages(targetPath)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { scanImages };
