/**
 * Storage module for FireCMS backend
 *
 * Provides file storage functionality with support for:
 * - Local filesystem storage (default, zero config)
 * - S3-compatible storage (AWS S3, MinIO)
 */

export * from './types';
export { LocalStorageController } from './LocalStorageController';
export { S3StorageController } from './S3StorageController';
export { createStorageRoutes } from './routes';
export type { StorageRoutesConfig } from './routes';
export * from './storage-registry';

import { StorageConfig, StorageController } from './types';
import { LocalStorageController } from './LocalStorageController';
import { S3StorageController } from './S3StorageController';

/**
 * Factory function to create a storage controller based on configuration
 */
export function createStorageController(config: StorageConfig): StorageController {
    switch (config.type) {
        case 'local':
            return new LocalStorageController(config);
        case 's3':
            return new S3StorageController(config);
        default:
            throw new Error(`Unknown storage type: ${(config as Record<string, unknown>).type}`);
    }
}
