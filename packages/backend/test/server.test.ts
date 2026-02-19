
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FireCMSApiServer } from '../src/api/server';
import { DataSourceDelegate, User } from '@firecms/types';
import { ApiConfig } from '../src/api/types';
import http from 'http';
import { AddressInfo } from 'net';

// Mock DataSourceDelegate
const mockWithAuth = vi.fn();
const mockDataSource: DataSourceDelegate & { withAuth: any } = {
    key: 'test-postgres',
    fetchCollection: vi.fn().mockImplementation(async () => {
        return [{ id: 'default-entity', values: { name: 'Default' } }];
    }),
    fetchEntity: vi.fn(),
    saveEntity: vi.fn(),
    deleteEntity: vi.fn(),
    countEntities: vi.fn(),
    withAuth: mockWithAuth
} as any;

const mockScopedDataSource = {
    ...mockDataSource,
    fetchCollection: vi.fn().mockImplementation(async () => {
        return [{ id: 'scoped-entity', values: { name: 'Scoped' } }];
    }),
    withAuth: undefined // Scoped delegate doesn't need withAuth
};

mockWithAuth.mockResolvedValue(mockScopedDataSource);

describe('FireCMSApiServer RLS Integration', () => {
    let server: FireCMSApiServer;
    let config: ApiConfig;
    let httpServer: http.Server;
    let baseUrl: string;

    beforeEach(() => {
        vi.clearAllMocks();
        config = {
            collections: [
                {
                    slug: 'test_collection',
                    name: 'Test Collection',
                    properties: { name: { dataType: 'string', name: 'Name' } }
                } as any
            ],
            auth: {
                enabled: true,
                validator: vi.fn()
            },
            enableREST: true
        };
        server = new FireCMSApiServer({ ...config, dataSource: mockDataSource });
    });

    afterEach((done) => {
        if (httpServer) {
            httpServer.close();
        }
    });

    const startServer = () => {
        return new Promise<void>((resolve) => {
            httpServer = server.getApp().listen(0, () => {
                const port = (httpServer.address() as AddressInfo).port;
                baseUrl = `http://localhost:${port}/api`;
                resolve();
            });
        });
    };

    it('should use default datasource when no auth is provided', async () => {
        // setup validator to return null (no auth)
        (config.auth!.validator as any).mockResolvedValue(null);
        await startServer();

        const response = await fetch(`${baseUrl}/test_collection`);
        const data = await response.json();

        expect(mockWithAuth).not.toHaveBeenCalled();
        expect(mockDataSource.fetchCollection).toHaveBeenCalled();
        expect(mockScopedDataSource.fetchCollection).not.toHaveBeenCalled();
        expect(data.data[0].name).toBe('Default');
    });

    it('should use scoped datasource when auth is provided and withAuth exists', async () => {
        const user: User = { uid: 'test-user', email: 'test@example.com' };
        // setup validator to return user
        (config.auth!.validator as any).mockResolvedValue(user);
        await startServer();

        const response = await fetch(`${baseUrl}/test_collection`);
        const data = await response.json();

        expect(mockWithAuth).toHaveBeenCalledWith(user);
        expect(mockDataSource.fetchCollection).not.toHaveBeenCalled();
        expect(mockScopedDataSource.fetchCollection).toHaveBeenCalled();
        expect(data.data[0].name).toBe('Scoped');
    });

    it('should fallback to default datasource if withAuth fails', async () => {
        const user: User = { uid: 'test-user', email: 'test@example.com' };
        (config.auth!.validator as any).mockResolvedValue(user);
        mockWithAuth.mockRejectedValue(new Error("Auth failed"));

        // Mock console.error to avoid noise
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        await startServer();

        const response = await fetch(`${baseUrl}/test_collection`);
        const data = await response.json();

        expect(mockWithAuth).toHaveBeenCalled();
        expect(mockDataSource.fetchCollection).toHaveBeenCalled();
        expect(data.data[0].name).toBe('Default');

        consoleSpy.mockRestore();
    });
});
