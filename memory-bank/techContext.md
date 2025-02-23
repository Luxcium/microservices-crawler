# Technical Context: Local Crawler Microservice

## Technology Stack

### Core Technologies

1. **Runtime Environment**
   - Node.js (LTS version)
   - TypeScript for type safety and better developer experience

2. **Framework & Libraries**

   ```json
   {
     "dependencies": {
       "express": "^4.18.x",       // Web framework
       "sharp": "^0.32.x",         // Image processing
       "sqlite3": "^5.1.x",        // Local database
       "winston": "^3.10.x",       // Logging
       "joi": "^17.9.x",          // Validation
       "dotenv": "^16.3.x",       // Configuration
       "crypto": "built-in",      // File hashing
       "fs-extra": "^11.1.x"      // Enhanced file operations
     },
     "devDependencies": {
       "typescript": "^5.1.x",
       "jest": "^29.6.x",
       "supertest": "^6.3.x",
       "eslint": "^8.45.x",
       "prettier": "^3.0.x"
     }
   }
   ```

### Infrastructure

1. **Containerization**
   - Docker
   - Docker Compose for local development
   - Multi-stage builds for production

2. **Data Storage**
   - SQLite for development
   - PostgreSQL for production
   - Migrations using Knex.js

## Development Setup

### Prerequisites

```bash
# Required software versions
Node.js >= 18.0.0
npm >= 9.0.0
Docker >= 20.10.0
Docker Compose >= 2.0.0
```

### Local Development

1. **Environment Setup**

   ```bash
   # Clone repository
   git clone <repository-url>
   cd crawler
   
   # Install dependencies
   npm install
   
   # Setup environment
   cp .env.example .env
   ```

2. **Configuration**

   ```env
   # .env file structure
   NODE_ENV=development
   API_PORT=3000
   SCAN_DIRS=/data/images,/data/videos
   FILE_TYPES=jpg,png,gif
   MAX_FILE_SIZE=10485760
   DB_CONNECTION=sqlite:///data/metadata.db
   LOG_LEVEL=debug
   ```

### Docker Configuration

1. **Development Dockerfile**

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   CMD ["npm", "run", "dev"]
   ```

2. **Production Dockerfile**

   ```dockerfile
   # Build stage
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   # Production stage
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY package*.json ./
   RUN npm ci --only=production
   CMD ["npm", "start"]
   ```

## Database Schema

### Tables

1. **files**

   ```sql
   CREATE TABLE files (
     id TEXT PRIMARY KEY,
     path TEXT NOT NULL,
     hash TEXT NOT NULL,
     size INTEGER NOT NULL,
     mime_type TEXT NOT NULL,
     created_at TIMESTAMP NOT NULL,
     updated_at TIMESTAMP NOT NULL,
     UNIQUE(hash)
   );
   ```

2. **metadata**

   ```sql
   CREATE TABLE metadata (
     file_id TEXT PRIMARY KEY,
     width INTEGER,
     height INTEGER,
     duration INTEGER,
     format TEXT,
     extra JSON,
     FOREIGN KEY(file_id) REFERENCES files(id)
   );
   ```

3. **scans**

   ```sql
   CREATE TABLE scans (
     id TEXT PRIMARY KEY,
     status TEXT NOT NULL,
     start_time TIMESTAMP NOT NULL,
     end_time TIMESTAMP,
     total_files INTEGER,
     processed_files INTEGER,
     error_count INTEGER,
     config JSON
   );
   ```

## API Documentation

### OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: Local Crawler API
  version: 1.0.0
paths:
  /api/scan:
    post:
      summary: Initiate new scan
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                directories:
                  type: array
                  items:
                    type: string
      responses:
        '202':
          description: Scan initiated
  /api/status/{scanId}:
    get:
      summary: Get scan status
      parameters:
        - name: scanId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Scan status
```

## Testing Strategy

### Unit Tests

- Service layer tests
- Repository tests
- Utility function tests

### Integration Tests

- API endpoint tests
- Database operations
- File system operations

### Performance Tests

- Large directory scanning
- Concurrent API requests
- Database query performance

## Monitoring & Logging

### Metrics

1. **System Metrics**
   - CPU usage
   - Memory consumption
   - Disk I/O
   - Network usage

2. **Application Metrics**
   - Scan duration
   - Files processed/second
   - Error rate
   - API response times

### Logging

```typescript
// Logging levels
{
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

// Log format
{
  timestamp: string,
  level: string,
  message: string,
  metadata: Record<string, any>
}
```

## Security Considerations

### File Access

- Read-only volume mounts
- File type validation
- Size limits
- Path traversal prevention

### API Security

- Rate limiting
- Input validation
- Error message sanitization
- Authentication (if required)

## Deployment

### Container Registry

- Docker Hub or private registry
- Versioned images
- Security scanning

### Resource Requirements

```yaml
# Minimum requirements
resources:
  limits:
    cpu: "1"
    memory: "1Gi"
  requests:
    cpu: "0.5"
    memory: "512Mi"
```

### Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
