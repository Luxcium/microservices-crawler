# Project Brief: Local Crawler Microservice

## Overview

A Docker-based microservice designed to scan local directories for images and other media files, extract metadata, and provide a RESTful API interface for other services to interact with the scanning functionality.

## Core Requirements

### Functional Requirements

1. **Directory Scanning**
   - Recursively traverse specified directories
   - Support multiple file types (images initially, extensible to other media)
   - Non-destructive read-only access to files
   - Filter capabilities for file types and sizes

2. **Metadata Processing**
   - Extract file metadata (dimensions, creation date, etc.)
   - Calculate file hashes for deduplication
   - Generate and maintain unique identifiers
   - Handle errors gracefully (corrupted files, access issues)

3. **Data Management**
   - Store metadata in a centralized database
   - Update existing records when files change
   - Support querying and filtering of results
   - Maintain scan history and statistics

4. **API Interface**
   - RESTful endpoints for scan operations
   - Status monitoring and health checks
   - Query interface for metadata retrieval
   - Support for scan configuration

### Non-Functional Requirements

1. **Performance**
   - Efficient directory traversal
   - Optimized hash calculation
   - Responsive API endpoints
   - Scalable metadata storage

2. **Security**
   - Read-only access to source files
   - API authentication/authorization
   - Secure configuration management
   - Audit logging

3. **Reliability**
   - Error recovery mechanisms
   - Consistent state management
   - Transaction safety for database operations
   - Comprehensive logging

4. **Maintainability**
   - Clear code organization
   - Comprehensive documentation
   - Modular design
   - Easy configuration

## Technical Constraints

- Must run in Docker container
- Read-only volume mapping for source directories
- Environment-based configuration
- RESTful API interface
- Database for metadata storage

## Success Criteria

1. Successfully scan and extract metadata from local directories
2. Provide accurate file information through API
3. Maintain data consistency and prevent duplicates
4. Handle errors gracefully without service interruption
5. Scale effectively with growing file collections
6. Integrate seamlessly with other microservices

## Timeline and Phases

1. **Phase 1: Core Infrastructure**
   - Basic directory scanning
   - Simple metadata extraction
   - Initial API endpoints
   - Base Docker configuration

2. **Phase 2: Enhanced Features**
   - Advanced metadata processing
   - Complete API implementation
   - Database optimization
   - Error handling improvements

3. **Phase 3: Integration & Polish**
   - Security enhancements
   - Performance optimization
   - Documentation completion
   - Integration testing
