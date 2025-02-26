/**
 * @fileoverview Core type definitions for the image crawler microservice.
 * These types are used throughout the application to ensure type safety and
 * provide consistent data structures.
 * 
 * @module Types
 */

/**
 * Represents metadata for a single image file
 * 
 * @interface ImageMetadata
 * @property {string} path - Relative path from the scan root directory
 * @property {string} absolutePath - Full filesystem path to the image
 * @property {number} size - File size in bytes
 * @property {Object} [dimensions] - Image dimensions (if available)
 * @property {number} dimensions.width - Image width in pixels
 * @property {number} dimensions.height - Image height in pixels
 * @property {string} hash - SHA-256 hash of the file content
 * @property {Date} created - File creation timestamp
 * @property {Date} modified - Last modification timestamp
 * 
 * @example
 * ```typescript
 * const metadata: ImageMetadata = {
 *   path: 'images/photo.jpg',
 *   absolutePath: '/home/user/images/photo.jpg',
 *   size: 1024,
 *   dimensions: { width: 1920, height: 1080 },
 *   hash: 'abc123...',
 *   created: new Date(),
 *   modified: new Date()
 * };
 * ```
 */
export interface ImageMetadata {
  path: string;
  absolutePath: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  hash: string;
  created: Date;
  modified: Date;
}

/**
 * Represents the result of a directory scan operation
 * 
 * @interface ScanResult
 * @property {string} id - Unique identifier for the scan operation
 * @property {Date} timestamp - When the scan was performed
 * @property {number} totalFiles - Total number of images found
 * @property {ImageMetadata[]} images - Array of metadata for each image
 * 
 * @example
 * ```typescript
 * const result: ScanResult = {
 *   id: 'scan-123',
 *   timestamp: new Date(),
 *   totalFiles: 5,
 *   images: [/* array of ImageMetadata objects *\/]
 * };
 * ```
 */
export interface ScanResult {
  id: string;
  timestamp: Date;
  totalFiles: number;
  images: ImageMetadata[];
}

/**
 * Standard error response format for API endpoints
 * 
 * @interface ErrorResponse
 * @property {string} code - Error code identifier (e.g., 'INVALID_PATH')
 * @property {string} message - Human-readable error message
 * @property {Record<string, unknown>} [details] - Additional error context
 * 
 * @example
 * ```typescript
 * const error: ErrorResponse = {
 *   code: 'INVALID_PATH',
 *   message: 'Directory not found',
 *   details: { path: '/invalid/path' }
 * };
 * ```
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
