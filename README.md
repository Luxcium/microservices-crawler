# File System Image Crawler

A microservice that scans directories for images and returns their metadata. Perfect for integration into other toolchains.

## Features

- Recursive directory scanning
- Image file detection and metadata extraction
- File hash calculation for uniqueness
- RESTful API interface
- Path validation
- Configurable scan options

## Installation

```bash
npm install
```

## Usage

### Start the Server

```bash
npm run build
npm start
```

The server will start on port 3000 (configurable via PORT environment variable).

### API Endpoints

1. **Scan Directory**
   ```bash
   POST /api/scan
   Content-Type: application/json

   {
     "path": "/path/to/scan",
     "options": {
       "recursive": true,
       "fileTypes": [".jpg", ".png", ".gif"],
       "maxSize": 10485760  // 10MB in bytes
     }
   }
   ```

2. **Validate Path**
   ```bash
   POST /api/validate
   Content-Type: application/json

   {
     "path": "/path/to/validate"
   }
   ```

3. **Health Check**
   ```bash
   GET /health
   ```

### Example Response (Scan)

```json
{
  "id": "4d8edfe1-7860-427c-8036-d174efc8da55",
  "timestamp": "2025-02-26T07:16:53.961Z",
  "totalFiles": 4,
  "images": [
    {
      "path": "relative/path/to/image.jpg",
      "absolutePath": "/full/path/to/image.jpg",
      "size": 3030,
      "hash": "029c63c6836c21478bf6ea3bd2f89e8249c3f054b0cb00147ba16e93a535b537",
      "created": "2025-02-25T12:00:31.357Z",
      "modified": "2025-02-25T12:00:31.359Z"
    }
  ]
}
```

### Docker Support

Build and run with Docker:

```bash
docker build -t image-crawler .
docker run -p 3000:3000 -v /path/to/scan:/data image-crawler
```

## Integration

To integrate with other services:

1. Start the crawler service
2. Make HTTP requests to the API endpoints
3. Process the JSON responses in your application

The service is designed to be stateless and can be easily integrated into larger systems.

## Error Handling

The service provides detailed error responses:

```json
{
  "code": "SCAN_ERROR",
  "message": "Error message here",
  "details": {
    "path": "/failed/path",
    "options": {}
  }
}
```

## Configuration Options

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment setting (development/production)

## Supported Image Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)
- TIFF (.tiff)

## License

MIT License - see LICENSE file for details
