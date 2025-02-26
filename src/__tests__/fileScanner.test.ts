/**
 * @fileoverview Test suite for the FileScanner module
 * Tests core functionality of directory scanning and image metadata extraction
 */

import { FileScanner } from '../services/scanner/fileScanner';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

/**
 * FileScanner Test Suite
 * 
 * Tests the following functionality:
 * - Directory scanning
 * - File type filtering
 * - Size validation
 * - Metadata extraction
 * - Error handling
 * 
 * Test structure:
 * 1. Setup test directory with sample files
 * 2. Run scanner with different configurations
 * 3. Verify results match expectations
 * 4. Clean up test files
 */
describe('FileScanner', () => {
  let testDir: string;
  let imageFiles: string[];

  /**
   * Set up test environment before all tests
   * Creates a temporary directory with test files
   */
  beforeAll(async () => {
    // Create a temporary test directory
    testDir = path.join(os.tmpdir(), 'file-scanner-test-' + Math.random().toString(36).slice(2));
    await fs.mkdir(testDir);

    // Create test subdirectories
    await fs.mkdir(path.join(testDir, 'subdir1'));
    await fs.mkdir(path.join(testDir, 'subdir2'));

    // Create test files
    imageFiles = [
      path.join(testDir, 'test1.jpg'),
      path.join(testDir, 'test2.png'),
      path.join(testDir, 'subdir1', 'test3.gif'),
      path.join(testDir, 'subdir2', 'test4.jpg')
    ];

    // Create empty files with image extensions
    for (const file of imageFiles) {
      await fs.writeFile(file, Buffer.from([]))
    }

    // Create a non-image file
    await fs.writeFile(path.join(testDir, 'not-an-image.txt'), 'test');
  });

  /**
   * Clean up test environment after all tests
   * Removes temporary test directory and files
   */
  afterAll(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  /**
   * Test: Basic directory scanning
   * Verifies that scanner finds all image files in the test directory
   * 
   * @test {FileScanner#scan}
   */
  it('should scan directory and find all images', async () => {
    const scanner = new FileScanner(testDir);
    const results = await scanner.scan();

    expect(results).toHaveLength(4);
    expect(results.map(r => path.basename(r.path))).toEqual(
      expect.arrayContaining(['test1.jpg', 'test2.png', 'test3.gif', 'test4.jpg'])
    );
  });

  /**
   * Test: Non-recursive scanning
   * Verifies that scanner only finds images in the top-level directory
   * when recursive option is disabled
   * 
   * @test {FileScanner#scan}
   */
  it('should respect non-recursive option', async () => {
    const scanner = new FileScanner(testDir);
    const results = await scanner.scan({ recursive: false });

    expect(results).toHaveLength(2);
    expect(results.map(r => path.basename(r.path))).toEqual(
      expect.arrayContaining(['test1.jpg', 'test2.png'])
    );
  });

  /**
   * Test: File type filtering
   * Verifies that scanner only finds images matching specified file types
   * 
   * @test {FileScanner#scan}
   */
  it('should filter by file type', async () => {
    const scanner = new FileScanner(testDir);
    const results = await scanner.scan({
      fileTypes: ['.jpg']
    });

    expect(results).toHaveLength(2);
    expect(results.map(r => path.basename(r.path))).toEqual(
      expect.arrayContaining(['test1.jpg', 'test4.jpg'])
    );
  });

  /**
   * Test: Size filtering
   * Verifies that scanner respects maximum file size configuration
   * 
   * @test {FileScanner#scan}
   */
  it('should respect maxSize option', async () => {
    const scanner = new FileScanner(testDir);
    const results = await scanner.scan({
      maxSize: 1 // 1 byte
    });

    // Since our test files are empty (0 bytes), they should all pass
    expect(results).toHaveLength(4);
  });

  /**
   * Test: Metadata generation
   * Verifies that scanner generates complete and correct metadata
   * for each image file
   * 
   * @test {FileScanner#scan}
   */
  it('should generate correct metadata', async () => {
    const scanner = new FileScanner(testDir);
    const results = await scanner.scan();
    const firstResult = results[0];

    expect(firstResult).toHaveProperty('path');
    expect(firstResult).toHaveProperty('absolutePath');
    expect(firstResult).toHaveProperty('size');
    expect(firstResult).toHaveProperty('hash');
    expect(firstResult).toHaveProperty('created');
    expect(firstResult).toHaveProperty('modified');
  });

  /**
   * Test: Error handling
   * Verifies that scanner handles invalid paths and permissions errors
   * 
   * @test {FileScanner#scan}
   */
  it('should handle errors gracefully', async () => {
    // Create a scanner with a non-existent directory
    const scanner = new FileScanner('/non/existent/path');
    
    await expect(scanner.scan()).rejects.toThrow();
  });
});
