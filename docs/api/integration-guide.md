# API Integration Guide

## Overview

The Image Crawler Microservice provides a RESTful API for scanning directories and retrieving image metadata. This guide covers integration patterns, authentication, error handling, and best practices.

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### 1. Scan Directory

Initiates a scan of a directory for images.

```http
POST /scan
Content-Type: application/json

{
  "path": "/path/to/scan",
  "options": {
    "recursive": true,
    "fileTypes": [".jpg", ".png", ".gif"],
    "maxSize": 10485760
  }
}
```

#### Response

```json
{
  "id": "scan-123",
  "timestamp": "2025-02-26T07:16:53.961Z",
  "totalFiles": 4,
  "images": [
    {
      "path": "relative/path/to/image.jpg",
      "absolutePath": "/full/path/to/image.jpg",
      "size": 1024,
      "hash": "sha256-hash",
      "created": "2025-02-26T07:16:53.961Z",
      "modified": "2025-02-26T07:16:53.961Z"
    }
  ]
}
```

### 2. Validate Path

Checks if a path exists and is accessible.

```http
POST /validate
Content-Type: application/json

{
  "path": "/path/to/validate"
}
```

#### Response

```json
{
  "valid": true,
  "path": "/absolute/path/to/validate"
}
```

or

```json
{
  "valid": false,
  "path": "/invalid/path",
  "reason": "ENOENT: no such file or directory"
}
```

### 3. Health Check

Verifies service health.

```http
GET /health
```

#### Response

```json
{
  "status": "healthy"
}
```

## Error Handling

### Error Response Format

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "details": {
    "additionalInfo": "..."
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Missing or invalid request parameters |
| `SCAN_ERROR` | Error during directory scanning |
| `ACCESS_DENIED` | Permission error accessing path |
| `INTERNAL_ERROR` | Unexpected server error |

## Integration Examples

### Node.js/TypeScript

```typescript
import axios from 'axios';

async function scanDirectory(path: string) {
  try {
    // First validate the path
    const validateResponse = await axios.post('http://localhost:3000/api/validate', {
      path
    });

    if (!validateResponse.data.valid) {
      throw new Error(`Invalid path: ${validateResponse.data.reason}`);
    }

    // Scan the directory
    const scanResponse = await axios.post('http://localhost:3000/api/scan', {
      path,
      options: {
        recursive: true,
        fileTypes: ['.jpg', '.png']
      }
    });

    return scanResponse.data;
  } catch (error) {
    console.error('Scan failed:', error.response?.data || error.message);
    throw error;
  }
}
```

### Python

```python
import requests

def scan_directory(path: str):
    base_url = 'http://localhost:3000/api'
    
    # Validate path
    validate_response = requests.post(f'{base_url}/validate', json={
        'path': path
    })
    validate_data = validate_response.json()
    
    if not validate_data['valid']:
        raise ValueError(f"Invalid path: {validate_data.get('reason')}")
    
    # Scan directory
    scan_response = requests.post(f'{base_url}/scan', json={
        'path': path,
        'options': {
            'recursive': True,
            'fileTypes': ['.jpg', '.png']
        }
    })
    
    return scan_response.json()
```

### Curl

```bash
# Validate path
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"path":"/path/to/validate"}'

# Scan directory
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/path/to/scan",
    "options": {
      "recursive": true,
      "fileTypes": [".jpg", ".png"]
    }
  }'
```

## Best Practices

1. **Always Validate First**
   - Use the /validate endpoint before scanning to ensure path accessibility
   - Handle validation errors gracefully

2. **Error Handling**
   - Implement proper error handling for all API calls
   - Check HTTP status codes and error responses
   - Provide meaningful error messages to users

3. **Resource Management**
   - Use pagination for large directories
   - Implement rate limiting in your client
   - Handle timeouts appropriately

4. **Performance**
   - Cache results when appropriate
   - Use compression for large responses
   - Implement retry logic for failed requests

5. **Security**
   - Validate all input paths
   - Implement proper authentication if required
   - Use HTTPS in production

## Rate Limiting

- Default: 100 requests per minute
- Headers:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time until limit resets

## Monitoring

Monitor API health using the /health endpoint:

```typescript
async function checkHealth() {
  try {
    const response = await axios.get('http://localhost:3000/api/health');
    return response.data.status === 'healthy';
  } catch (error) {
    return false;
  }
}
```

## Common Issues

1. **Path Not Found**
   ```json
   {
     "code": "INVALID_REQUEST",
     "message": "Path not found",
     "details": {
       "path": "/non/existent/path"
     }
   }
   ```

2. **Permission Denied**
   ```json
   {
     "code": "ACCESS_DENIED",
     "message": "Permission denied",
     "details": {
       "path": "/restricted/path"
     }
   }
   ```

3. **Invalid Options**
   ```json
   {
     "code": "INVALID_REQUEST",
     "message": "Invalid options",
     "details": {
       "invalidFields": ["fileTypes"]
     }
   }
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `MAX_FILE_SIZE` | Maximum file size | 100MB |
| `RATE_LIMIT` | Rate limit | 100/minute |

## Versioning

The API uses semantic versioning. Current version: v1.0.0

## Support

For issues and support:
- GitHub Issues: [repo-url/issues](https://github.com/your-repo/issues)
- Email: support@example.com
