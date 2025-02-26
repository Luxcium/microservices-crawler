/**
 * @fileoverview API router for the image crawler microservice.
 * Provides RESTful endpoints for scanning directories and managing image metadata.
 * 
 * @module API
 */

import express from 'express';
import { json } from 'express';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { FileScanner, ScanOptions } from '../services/scanner/fileScanner';
import { ScanResult, ErrorResponse } from '../models/types';

const router = express.Router();
router.use(json());

/**
 * Request body structure for scan endpoint
 * 
 * @interface ScanRequest
 * @property {string} path - Directory path to scan
 * @property {Partial<ScanOptions>} [options] - Optional scanning configuration
 */
interface ScanRequest {
  path: string;
  options?: Partial<ScanOptions>;
}

/**
 * POST /scan - Initiates a new directory scan for images
 * 
 * @route POST /scan
 * @param {ScanRequest} req.body - Request body containing path and options
 * @returns {Promise<ScanResult>} Result containing found images and metadata
 * @throws {ErrorResponse} If path is invalid or scan fails
 * 
 * @example
 * ```typescript
 * // Request
 * POST /scan
 * {
 *   "path": "/path/to/scan",
 *   "options": {
 *     "recursive": true,
 *     "fileTypes": [".jpg", ".png"]
 *   }
 * }
 * 
 * // Response
 * {
 *   "id": "scan-123",
 *   "timestamp": "2025-02-26T07:16:53.961Z",
 *   "totalFiles": 4,
 *   "images": [...]
 * }
 * ```
 */
router.post('/scan', asyncHandler(async (req, res) => {
  const { path: scanPath, options = {} } = req.body as ScanRequest;

  if (!scanPath) {
    const error: ErrorResponse = {
      code: 'INVALID_REQUEST',
      message: 'Path is required'
    };
    res.status(400).json(error);
    return;
  }

  try {
    const absolutePath = path.resolve(scanPath);
    const scanner = new FileScanner(absolutePath);
    const images = await scanner.scan(options);

    const result: ScanResult = {
      id: uuidv4(),
      timestamp: new Date(),
      totalFiles: images.length,
      images
    };

    res.status(200).json(result);
  } catch (error) {
    const errorResponse: ErrorResponse = {
      code: 'SCAN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: {
        path: scanPath,
        options
      }
    };
    res.status(500).json(errorResponse);
  }
}));

/**
 * GET /health - Service health check endpoint
 * 
 * @route GET /health
 * @returns {Object} Health status of the service
 * 
 * @example
 * ```typescript
 * // Response
 * {
 *   "status": "healthy"
 * }
 * ```
 */
router.get('/health', (_, res) => {
  res.status(200).json({ status: 'healthy' });
});

/**
 * POST /validate - Validates if a path exists and is accessible
 * 
 * @route POST /validate
 * @param {Object} req.body - Request body
 * @param {string} req.body.path - Path to validate
 * @returns {Object} Validation result with path status
 * 
 * @example
 * ```typescript
 * // Request
 * POST /validate
 * {
 *   "path": "/path/to/validate"
 * }
 * 
 * // Success Response
 * {
 *   "valid": true,
 *   "path": "/absolute/path/to/validate"
 * }
 * 
 * // Error Response
 * {
 *   "valid": false,
 *   "path": "/invalid/path",
 *   "reason": "ENOENT: no such file or directory"
 * }
 * ```
 */
router.post('/validate', asyncHandler(async (req, res) => {
  const { path: testPath } = req.body;

  if (!testPath) {
    const error: ErrorResponse = {
      code: 'INVALID_REQUEST',
      message: 'Path is required'
    };
    res.status(400).json(error);
    return;
  }

  try {
    const absolutePath = path.resolve(testPath);
    await fs.access(absolutePath);
    res.status(200).json({ valid: true, path: absolutePath });
  } catch (error) {
    res.status(200).json({ 
      valid: false, 
      path: testPath,
      reason: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Global error handling middleware
 * Converts various error types into consistent ErrorResponse format
 * 
 * @param {Error} err - Caught error
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next function
 * 
 * @example
 * ```typescript
 * // Error Response
 * {
 *   "code": "INTERNAL_ERROR",
 *   "message": "An internal error occurred",
 *   "details": {
 *     "error": "Detailed error message"
 *   }
 * }
 * ```
 */
router.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const error: ErrorResponse = {
    code: 'INTERNAL_ERROR',
    message: 'An internal error occurred',
    details: process.env.NODE_ENV === 'development' ? { error: err.message } : undefined
  };
  
  res.status(500).json(error);
});

export default router;
