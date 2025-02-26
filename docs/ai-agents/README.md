# AI Agent Guide for Image Crawler Microservice

This guide is designed to help AI agents understand, use, and extend the image crawler microservice.

## Quick Start

```typescript
import { FileScanner } from '../services/scanner/fileScanner';

// Create scanner instance
const scanner = new FileScanner('/path/to/scan');

// Basic scan
const images = await scanner.scan();

// Advanced scan with options
const filteredImages = await scanner.scan({
  recursive: true,
  fileTypes: ['.jpg', '.png'],
  maxSize: 5 * 1024 * 1024 // 5MB
});
```

## Core Components

### 1. FileScanner
Primary class for scanning directories and extracting image metadata.
```typescript
interface ScannerBehavior {
  purpose: "Directory traversal and metadata extraction";
  inputTypes: ["directory paths", "file paths"];
  outputTypes: ["ImageMetadata[]"];
  errorHandling: "Graceful with detailed errors";
}
```

### 2. API Layer
RESTful interface for remote access.
```typescript
interface APIEndpoints {
  "/scan": "POST - Scan directories for images",
  "/validate": "POST - Validate path accessibility",
  "/health": "GET - Service health check"
}
```

### 3. Type System
Strong TypeScript types for all components.
```typescript
interface TypeSystem {
  core: ["ImageMetadata", "ScanOptions", "ScanResult"];
  api: ["ScanRequest", "ErrorResponse"];
  utils: ["HashFunction"];
}
```

## Extension Points

1. **New File Types**
```typescript
// Add support for new image formats
const extendedOptions: ScanOptions = {
  fileTypes: [...defaultTypes, '.webp', '.avif']
};
```

2. **Custom Metadata**
```typescript
// Extend ImageMetadata interface
interface ExtendedMetadata extends ImageMetadata {
  exif?: {
    camera: string;
    timestamp: Date;
  };
}
```

3. **Additional Validation**
```typescript
// Add custom validation rules
async function customValidation(path: string): Promise<boolean> {
  // Your validation logic
}
```

## Common Integration Patterns

1. **Directory Scanning**
```typescript
// Recursive scan with progress tracking
let processed = 0;
const scanner = new FileScanner(rootDir);
const images = await scanner.scan({
  recursive: true,
  onProgress: (file) => {
    processed++;
    console.log(`Processed: ${processed} files`);
  }
});
```

2. **Metadata Processing**
```typescript
// Extract and process metadata
const images = await scanner.scan();
const metadata = images.map(img => ({
  path: img.absolutePath,
  size: (img.size / 1024).toFixed(2) + ' KB',
  created: img.created.toISOString()
}));
```

3. **Error Handling**
```typescript
try {
  const scanner = new FileScanner(path);
  const images = await scanner.scan();
} catch (error) {
  if (error.code === 'ENOENT') {
    // Handle missing directory
  } else if (error.code === 'EACCES') {
    // Handle permission error
  }
}
```

## Best Practices

1. **Resource Management**
```typescript
// Use reasonable batch sizes
const scanner = new FileScanner(largeDir);
const images = await scanner.scan({
  batchSize: 1000,
  concurrency: 4
});
```

2. **Error Handling**
```typescript
// Implement proper error handling
async function safeScan(path: string) {
  try {
    const scanner = new FileScanner(path);
    return await scanner.scan();
  } catch (error) {
    console.error(`Scan failed: ${error.message}`);
    return [];
  }
}
```

3. **Data Validation**
```typescript
// Validate scan results
function validateResults(images: ImageMetadata[]): boolean {
  return images.every(img => {
    return img.path && img.size >= 0 && img.hash;
  });
}
```

## Testing Guidelines

1. **Unit Tests**
```typescript
describe('FileScanner', () => {
  it('should handle empty directories', async () => {
    const scanner = new FileScanner(emptyDir);
    const results = await scanner.scan();
    expect(results).toHaveLength(0);
  });
});
```

2. **Integration Tests**
```typescript
describe('API Integration', () => {
  it('should process scan requests', async () => {
    const response = await request(app)
      .post('/api/scan')
      .send({ path: testDir });
    expect(response.status).toBe(200);
  });
});
```

## Memory Management

To handle large directories efficiently:

```typescript
// Configure memory-efficient scanning
const scanner = new FileScanner(largeDir);
const images = await scanner.scan({
  highWaterMark: 64 * 1024, // 64KB chunks
  maxBufferSize: 100 * 1024 * 1024 // 100MB
});
```

## Performance Optimization

Tips for optimal performance:

1. Use file type filtering early to reduce processing
2. Implement batched processing for large directories
3. Configure appropriate concurrency levels
4. Cache hash calculations for frequently accessed files
5. Use streaming for large file operations

## Security Considerations

1. **Path Validation**
```typescript
import { isValidPath } from '../utils/security';

// Always validate paths
if (!isValidPath(userProvidedPath)) {
  throw new Error('Invalid path');
}
```

2. **Access Control**
```typescript
// Check permissions before scanning
await fs.access(path, fs.constants.R_OK);
```

Remember to:
- Validate all inputs
- Handle errors gracefully
- Respect file system permissions
- Monitor resource usage
- Implement proper logging
