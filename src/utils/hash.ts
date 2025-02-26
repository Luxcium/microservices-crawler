/**
 * @fileoverview Utility functions for file hashing and integrity checks.
 * This module provides efficient streaming-based file hashing functionality.
 * 
 * @module Hash
 */

import { createHash } from 'crypto';
import { createReadStream } from 'fs';

/**
 * Calculates a SHA-256 hash of a file using streaming for memory efficiency.
 * This function reads the file in chunks rather than loading it entirely into memory.
 * 
 * @param filePath - Path to the file to hash
 * @returns Promise that resolves to the hex-encoded SHA-256 hash
 * @throws {Error} If the file cannot be read or accessed
 * 
 * @example
 * ```typescript
 * try {
 *   const hash = await calculateFileHash('/path/to/file.jpg');
 *   console.log('File hash:', hash);
 * } catch (error) {
 *   console.error('Failed to calculate hash:', error);
 * }
 * ```
 * 
 * @remarks
 * - Uses Node.js crypto module for cryptographic operations
 * - Processes files in 64KB chunks by default
 * - Returns lowercase hex-encoded hash string
 * - Suitable for large files due to streaming approach
 */
export async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a SHA-256 hash object
    const hash = createHash('sha256');
    
    // Create a read stream with a reasonable chunk size
    const stream = createReadStream(filePath, { highWaterMark: 64 * 1024 });

    // Handle stream events
    stream.on('error', error => reject(error));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}
