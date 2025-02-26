/**
 * @fileoverview FileScanner module provides functionality for scanning directories and extracting image metadata.
 * This is the core component of the image crawler microservice.
 * 
 * @module FileScanner
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ImageMetadata } from '../../models/types';
import { calculateFileHash } from '../../utils/hash';

/**
 * Configuration options for the file scanning process
 * 
 * @interface ScanOptions
 * @property {boolean} recursive - Whether to scan subdirectories recursively
 * @property {boolean} includeZips - Whether to scan inside zip files (if supported)
 * @property {string[]} fileTypes - Array of file extensions to scan for (e.g., ['.jpg', '.png'])
 * @property {number} [maxSize] - Maximum file size in bytes (optional)
 */
export interface ScanOptions {
  recursive: boolean;
  includeZips: boolean;
  fileTypes: string[];
  maxSize?: number;
}

/**
 * FileScanner is responsible for traversing directories and collecting metadata about image files.
 * It supports recursive scanning, file type filtering, and size limitations.
 * 
 * @example
 * ```typescript
 * const scanner = new FileScanner('/path/to/scan');
 * const images = await scanner.scan({
 *   recursive: true,
 *   fileTypes: ['.jpg', '.png'],
 *   maxSize: 1024 * 1024 // 1MB
 * });
 * ```
 */
export class FileScanner {
  /**
   * Default scanning options used when no options are provided
   * @private
   */
  private readonly defaultOptions: ScanOptions = {
    recursive: true,
    includeZips: true,
    fileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'],
  };

  /**
   * Creates a new FileScanner instance
   * 
   * @param rootPath - The base directory path to start scanning from
   * @throws {Error} If the path is invalid or inaccessible
   */
  constructor(private readonly rootPath: string) {}

  /**
   * Initiates a scan of the directory for image files
   * 
   * @param options - Optional configuration for the scanning process
   * @returns Promise resolving to an array of image metadata
   * @throws {Error} If scanning fails or directory is inaccessible
   * 
   * @example
   * ```typescript
   * const images = await scanner.scan({
   *   recursive: true,
   *   fileTypes: ['.jpg', '.png']
   * });
   * ```
   */
  public async scan(options: Partial<ScanOptions> = {}): Promise<ImageMetadata[]> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const results: ImageMetadata[] = [];

    try {
      await this.scanDirectory(this.rootPath, results, mergedOptions);
      return results;
    } catch (error) {
      console.error(`Error scanning directory ${this.rootPath}:`, error);
      throw error;
    }
  }

  /**
   * Recursively scans a directory for image files
   * 
   * @param dirPath - Directory path to scan
   * @param results - Array to collect results
   * @param options - Scanning options
   * @throws {Error} If directory cannot be read or accessed
   * @private
   */
  private async scanDirectory(
    dirPath: string,
    results: ImageMetadata[],
    options: ScanOptions
  ): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory() && options.recursive) {
        await this.scanDirectory(fullPath, results, options);
        continue;
      }

      if (entry.isFile() && this.isValidImageFile(entry.name, options)) {
        try {
          const metadata = await this.getImageMetadata(fullPath);
          if (await this.isValidSize(metadata, options.maxSize)) {
            results.push(metadata);
          }
        } catch (error) {
          console.error(`Error processing file ${fullPath}:`, error);
        }
      }
    }
  }

  /**
   * Checks if a file matches the configured file types
   * 
   * @param fileName - Name of the file to check
   * @param options - Scanning options containing file types
   * @returns True if file extension matches configured types
   * @private
   */
  private isValidImageFile(fileName: string, options: ScanOptions): boolean {
    const ext = path.extname(fileName).toLowerCase();
    return options.fileTypes.includes(ext);
  }

  /**
   * Validates if a file's size is within the configured limit
   * 
   * @param metadata - File metadata containing size information
   * @param maxSize - Maximum allowed size in bytes
   * @returns Promise resolving to true if file size is valid
   * @private
   */
  private async isValidSize(metadata: ImageMetadata, maxSize?: number): Promise<boolean> {
    if (!maxSize) return true;
    return metadata.size <= maxSize;
  }

  /**
   * Extracts metadata from an image file
   * 
   * @param filePath - Path to the image file
   * @returns Promise resolving to image metadata
   * @throws {Error} If file cannot be read or metadata extraction fails
   * @private
   */
  private async getImageMetadata(filePath: string): Promise<ImageMetadata> {
    const stats = await fs.stat(filePath);
    const hash = await calculateFileHash(filePath);

    return {
      path: path.relative(this.rootPath, filePath),
      absolutePath: path.resolve(filePath),
      size: stats.size,
      hash,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  }
}
