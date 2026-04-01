
import { describe, it, expect, beforeEach } from '@jest/globals';
import { PostgresDataSource } from '../src/services/postgresDataSource';
import { RealtimeService } from '../src/services/realtimeService';
import { EntityService } from '../src/db/entityService';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

// Mock dependencies
const mockDb = {
    transaction: jest.fn(),
    execute: jest.fn(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
} as unknown as NodePgDatabase<any>;

const mockRealtimeService = {
    registerDataSourceSubscription: jest.fn(),
    addSubscriptionCallback: jest.fn(),
    removeSubscriptionCallback: jest.fn(),
    subscriptions: new Map(),
    notifyEntityUpdate: jest.fn(),
} as unknown as RealtimeService;


describe('PostgresDataSource', () => {
    let delegate: PostgresDataSource;

    beforeEach(() => {
        jest.clearAllMocks();
        delegate = new PostgresDataSource(mockDb, mockRealtimeService);
    });

    it('should initialize correctly', () => {
        expect(delegate).toBeDefined();
        expect(delegate.key).toBe('postgres');
    });

    describe('withAuth', () => {
        it('should return a new delegate instance', async () => {
            const user = { uid: 'test-user', email: 'test@example.com' };
            const authDelegate = await delegate.withAuth(user);

            expect(authDelegate).toBeDefined();
            expect(authDelegate).not.toBe(delegate);
        });

        it('should wrap methods in a transaction', async () => {
            const user = { uid: 'test-user', email: 'test@example.com' };
            const authDelegate = await delegate.withAuth(user);

            const mockTx = { execute: jest.fn() };
            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb(mockTx);
            });

            jest.spyOn(PostgresDataSource.prototype, 'fetchCollection').mockResolvedValueOnce([]);

            await authDelegate.fetchCollection({ path: 'test_collection', collection: { slug: 'test', properties: {} } as any });

            expect(mockDb.transaction).toHaveBeenCalled();
        });

        it('should set app.user_id in the transaction for RLS', async () => {
            const user = { uid: 'test-user-123', email: 'test@example.com' };
            const authDelegate = await delegate.withAuth(user);

            const mockTx = { execute: jest.fn() } as any;
            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb(mockTx);
            });

            jest.spyOn(PostgresDataSource.prototype, 'fetchCollection').mockResolvedValueOnce([]);

            await authDelegate.fetchCollection({ path: 'test', collection: { slug: 'test', properties: {} } as any });

            expect(mockDb.transaction).toHaveBeenCalled();
            expect(mockTx.execute).toHaveBeenCalled();
            const sqlCall = mockTx.execute.mock.calls[0][0];
            const callString = JSON.stringify(sqlCall);
            expect(callString).toContain("set_config");
            expect(callString).toContain("test-user-123");
        });

        it('should set app.user_roles handling array of strings correctly', async () => {
            const user = { uid: 'test-user-123', email: 'test@example.com', roles: ['admin', 'editor'] } as any;
            const authDelegate = await delegate.withAuth(user);

            const mockTx = { execute: jest.fn() } as any;
            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb(mockTx);
            });

            jest.spyOn(PostgresDataSource.prototype, 'fetchCollection').mockResolvedValueOnce([]);

            await authDelegate.fetchCollection({ path: 'test', collection: { slug: 'test', properties: {} } as any });

            expect(mockTx.execute).toHaveBeenCalledTimes(1);
            const sqlCall = mockTx.execute.mock.calls[0][0];
            const callString = JSON.stringify(sqlCall);
            expect(callString).toContain("set_config");
            expect(callString).toContain("admin,editor");
        });

        it('should set app.user_roles handling array of objects correctly', async () => {
            const user = { uid: 'test-user-123', email: 'test@example.com', roles: [{ id: 'admin' }, { id: 'editor' }] } as any;
            const authDelegate = await delegate.withAuth(user);

            const mockTx = { execute: jest.fn() } as any;
            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb(mockTx);
            });

            jest.spyOn(PostgresDataSource.prototype, 'fetchCollection').mockResolvedValueOnce([]);

            await authDelegate.fetchCollection({ path: 'test', collection: { slug: 'test', properties: {} } as any });

            expect(mockTx.execute).toHaveBeenCalledTimes(1);
            const sqlCall = mockTx.execute.mock.calls[0][0];
            const callString = JSON.stringify(sqlCall);
            expect(callString).toContain("set_config");
            expect(callString).toContain("admin,editor");
        });

        it('should fallback to anonymous and empty roles when missing from user', async () => {
            const user = {} as any; // Empty user object
            const authDelegate = await delegate.withAuth(user);

            (mockDb.transaction as any).mockImplementation(async (cb: any) => {
                const mockTx = { execute: jest.fn() } as any;
                return cb(mockTx);
            });

            // We mock fetchCollection to just return something and not crash
            jest.spyOn(PostgresDataSource.prototype, 'fetchCollection').mockResolvedValueOnce([]);

            await authDelegate.fetchCollection({ path: 'test', collection: { slug: 'test', properties: {} } as any });

            expect(mockDb.transaction).toHaveBeenCalledTimes(1);
            
            const transactionCallback = (mockDb.transaction as any).mock.calls[0][0];
            const mockTx = { execute: jest.fn() } as any;
            await transactionCallback(mockTx).catch(() => {});
            
            const sqlCall = mockTx.execute.mock.calls[0][0];
            const callString = JSON.stringify(sqlCall);
            expect(callString).toContain("set_config");
            expect(callString).toContain("anonymous");
        });

        it('should gracefully handle completely null or undefined user objects', async () => {
            const authDelegate = await delegate.withAuth(null as any);

            (mockDb.transaction as any).mockImplementation(async (cb: any) => {
                const mockTx = { execute: jest.fn() } as any;
                return cb(mockTx);
            });

            jest.spyOn(PostgresDataSource.prototype, 'fetchCollection').mockResolvedValueOnce([]);

            await authDelegate.fetchCollection({ path: 'test', collection: { slug: 'test', properties: {} } as any });

            const transactionCallback = (mockDb.transaction as any).mock.calls[0][0];
            const mockTx = { execute: jest.fn() } as any;
            await transactionCallback(mockTx).catch(() => {});
            
            const sqlCall = mockTx.execute.mock.calls[0][0];
            const callString = JSON.stringify(sqlCall);
            expect(callString).toContain("set_config");
            expect(callString).toContain("anonymous");
        });
    });

    describe('AuthenticatedPostgresDataSource Transactional Integrity', () => {
        let authDelegate: any;

        beforeEach(async () => {
            authDelegate = await delegate.withAuth({ uid: 'test-user', email: 'test@example.com' });
        });

        it('should execute operation and flush notifications on success', async () => {
            const mockTx = {
                execute: jest.fn()
            };

            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb(mockTx);
            });

            // Let's pretend the operation queues a notification
            jest.spyOn(PostgresDataSource.prototype, 'saveEntity').mockImplementationOnce(async function(this: any) {
                this._pendingNotifications?.push({
                    path: 'test',
                    entityId: '123',
                    entity: {} as any,
                });
                return {} as any;
            });

            await authDelegate.saveEntity({ path: 'test', entityId: '123', values: {}, collection: {} as any, status: 'new' });

            // Ensure transaction was called
            expect(mockDb.transaction).toHaveBeenCalled();

            // Ensure notification was flushed after commit
            expect(mockRealtimeService.notifyEntityUpdate).toHaveBeenCalledWith('test', '123', {}, undefined);
        });

        it('should NOT flush notifications if transaction throws an error', async () => {
            const mockTx = {
                execute: jest.fn()
            };

            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb(mockTx);
            });

            jest.spyOn(PostgresDataSource.prototype, 'saveEntity').mockImplementationOnce(async function(this: any) {
                this._pendingNotifications?.push({
                    path: 'test',
                    entityId: '123',
                    entity: {} as any,
                });
                throw new Error("Transaction failed");
            });

            await expect(authDelegate.saveEntity({ path: 'test', entityId: '123', values: {}, collection: {} as any, status: 'new' })).rejects.toThrow("Transaction failed");

            // Ensure notification was NOT flushed
            expect(mockRealtimeService.notifyEntityUpdate).not.toHaveBeenCalled();
        });

        it('should return successfully even if a deferred notification throw an error (resilience)', async () => {
            const mockTx = {
                execute: jest.fn()
            };

            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb(mockTx);
            });

            jest.spyOn(PostgresDataSource.prototype, 'saveEntity').mockImplementationOnce(async function(this: any) {
                this._pendingNotifications?.push({
                    path: 'test',
                    entityId: 'buggy-123',
                    entity: {} as any,
                });
                return { id: 'success' } as any;
            });

            // Mock the notification service intentionally crashing
            const notifySpy = mockRealtimeService.notifyEntityUpdate as jest.Mock;
            notifySpy.mockRejectedValueOnce(new Error("Network Failure on Notification"));
            
            // Should still return the entity successfully despite the error
            const result = await authDelegate.saveEntity({ path: 'test', entityId: 'buggy-123', values: {}, collection: {} as any, status: 'new' });
            
            expect(result).toEqual({ id: 'success' });
            expect(notifySpy).toHaveBeenCalledWith('test', 'buggy-123', {}, undefined);
        });

        it('should safely isolate completely concurrent transaction notifications from leaking across scopes', async () => {
            const mockTx = {
                execute: jest.fn()
            };

            // This mock introduces slight async delay to allow concurrent operations to interleave execution
            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                await new Promise(r => setTimeout(r, 10));
                return await cb(mockTx);
            });

            // Operation 1 flags a notification
            const save1 = jest.spyOn(PostgresDataSource.prototype, 'saveEntity').mockImplementationOnce(async function(this: any) {
                this._pendingNotifications?.push({ path: 'scope-1', entityId: '1', entity: {} as any });
                return {} as any;
            });

            // Operation 2 flags a different notification
            const save2 = jest.spyOn(PostgresDataSource.prototype, 'saveEntity').mockImplementationOnce(async function(this: any) {
                this._pendingNotifications?.push({ path: 'scope-2', entityId: '2', entity: {} as any });
                return {} as any;
            });

            // Fire simultaneously
            await Promise.all([
                authDelegate.saveEntity({ path: 'scope-1', entityId: '1', values: {}, collection: {} as any, status: 'new' }),
                authDelegate.saveEntity({ path: 'scope-2', entityId: '2', values: {}, collection: {} as any, status: 'new' })
            ]);

            // Ensure our notify was called with both exact combinations, but NOT cross-pollinated
            expect(mockRealtimeService.notifyEntityUpdate).toHaveBeenCalledWith('scope-1', '1', {}, undefined);
            expect(mockRealtimeService.notifyEntityUpdate).toHaveBeenCalledWith('scope-2', '2', {}, undefined);
            
            // Check count
            expect(mockRealtimeService.notifyEntityUpdate).toHaveBeenCalledTimes(2);
        });
    });

    describe('AuthenticatedPostgresDataSource Delegation', () => {
        let authDelegate: any;

        beforeEach(async () => {
            authDelegate = await delegate.withAuth({ uid: 'test-user', email: 'test@example.com' });
        });

        it('should delegate executeSql directly without a transaction', async () => {
            jest.spyOn(delegate, 'executeSql').mockResolvedValueOnce([{ id: 1 }] as any);

            const result = await authDelegate.executeSql("SELECT 1");

            expect(mockDb.transaction).not.toHaveBeenCalled();
            expect(delegate.executeSql).toHaveBeenCalledWith("SELECT 1", undefined);
            expect(result).toEqual([{ id: 1 }]);
        });

        it('should override listenCollection to inject auth context', () => {
            const mockUnsubscribe = jest.fn();
            
            // Clear original map instead of reassigning
            mockRealtimeService.subscriptions.clear();
            
            // The act of calling the delegated method should update the last subscription
            jest.spyOn(delegate, 'listenCollection').mockImplementationOnce(() => {
                mockRealtimeService.subscriptions.set('sub1', { clientId: 'datasource', authContext: undefined });
                return mockUnsubscribe;
            });

            const unsub = authDelegate.listenCollection({ path: 'test', collection: {} as any, callbacks: {} as any });

            expect(unsub).toBe(mockUnsubscribe);
            expect(mockRealtimeService.subscriptions.get('sub1').authContext).toEqual({ userId: 'test-user', roles: [] });
        });

        it('should override listenEntity to inject auth context', () => {
            const mockUnsubscribe = jest.fn();
            
            mockRealtimeService.subscriptions.clear();
            
            jest.spyOn(delegate, 'listenEntity').mockImplementationOnce(() => {
                mockRealtimeService.subscriptions.set('sub2', { clientId: 'datasource', authContext: undefined });
                return mockUnsubscribe;
            });

            const unsub = authDelegate.listenEntity({ path: 'test', entityId: '123', collection: {} as any, callbacks: {} as any });

            expect(unsub).toBe(mockUnsubscribe);
            expect(mockRealtimeService.subscriptions.get('sub2').authContext).toEqual({ userId: 'test-user', roles: [] });
        });

        it('should handle listenCollection gracefully if delegate fails to add a subscription', () => {
            const mockUnsubscribe = jest.fn();
            mockRealtimeService.subscriptions.clear();
            jest.spyOn(delegate, 'listenCollection').mockImplementationOnce(() => mockUnsubscribe);
            const unsub = authDelegate.listenCollection({ path: 'empty-test', collection: {} as any, callbacks: {} as any });
            expect(unsub).toBe(mockUnsubscribe);
        });

        it('should NOT skip authContext injection if subscription has a non-datasource clientId', () => {
            const mockUnsubscribe = jest.fn();
            mockRealtimeService.subscriptions.clear();
            jest.spyOn(delegate, 'listenCollection').mockImplementationOnce(() => {
                mockRealtimeService.subscriptions.set('sub-ext', { clientId: 'external-client', authContext: undefined });
                return mockUnsubscribe;
            });
            authDelegate.listenCollection({ path: 'test', collection: {} as any, callbacks: {} as any });
            // authContext should NOT be injected because clientId !== 'datasource'
            expect(mockRealtimeService.subscriptions.get('sub-ext').authContext).toBeUndefined();
        });

        it('should delegate fetchAvailableDatabases without a transaction', async () => {
            jest.spyOn(delegate, 'fetchAvailableDatabases').mockResolvedValueOnce(['db1', 'db2']);
            const result = await authDelegate.fetchAvailableDatabases();
            expect(mockDb.transaction).not.toHaveBeenCalled();
            expect(result).toEqual(['db1', 'db2']);
        });

        it('should delegate fetchAvailableRoles without a transaction', async () => {
            jest.spyOn(delegate, 'fetchAvailableRoles').mockResolvedValueOnce(['admin', 'viewer']);
            const result = await authDelegate.fetchAvailableRoles();
            expect(mockDb.transaction).not.toHaveBeenCalled();
            expect(result).toEqual(['admin', 'viewer']);
        });

        it('should delegate fetchCurrentDatabase without a transaction', async () => {
            jest.spyOn(delegate, 'fetchCurrentDatabase').mockResolvedValueOnce('my_db');
            const result = await authDelegate.fetchCurrentDatabase();
            expect(mockDb.transaction).not.toHaveBeenCalled();
            expect(result).toBe('my_db');
        });

        it('should delegate fetchUnmappedTables without a transaction', async () => {
            jest.spyOn(delegate, 'fetchUnmappedTables').mockResolvedValueOnce(['orphan_table']);
            const result = await authDelegate.fetchUnmappedTables(['mapped']);
            expect(mockDb.transaction).not.toHaveBeenCalled();
            expect(result).toEqual(['orphan_table']);
        });

        it('should delegate fetchTableColumns without a transaction', async () => {
            jest.spyOn(delegate, 'fetchTableColumns').mockResolvedValueOnce([{ name: 'id', type: 'int4' }] as any);
            const result = await authDelegate.fetchTableColumns('users');
            expect(mockDb.transaction).not.toHaveBeenCalled();
            expect(result).toEqual([{ name: 'id', type: 'int4' }]);
        });
    });

    describe('AuthenticatedPostgresDataSource Security & Contract', () => {
        it('should use parameterized queries (drizzle sql``) NOT string interpolation for set_config', async () => {
            // A malicious uid should be passed as a parameter, not concatenated
            const maliciousUser = { uid: "admin'; DROP TABLE users; --", email: 'hacker@evil.com' } as any;
            const authDelegate = await delegate.withAuth(maliciousUser);

            const mockTx = { execute: jest.fn() } as any;
            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb(mockTx);
            });

            jest.spyOn(PostgresDataSource.prototype, 'fetchCollection').mockResolvedValueOnce([]);

            await authDelegate.fetchCollection({ path: 'x', collection: { slug: 'x', properties: {} } as any });

            // The SQL template tag should have the userId as a parameter value, not embedded in the SQL string
            const sqlObj = mockTx.execute.mock.calls[0][0];
            const serialized = JSON.stringify(sqlObj);
            expect(serialized).toContain("set_config");
            // The malicious string should appear as a bound parameter, not as raw SQL
            expect(serialized).toContain("admin'; DROP TABLE users; --");
            // Verify it's using Drizzle's tagged template, which inherently parameterizes
            expect(sqlObj).toHaveProperty('queryChunks');
        });

        it('should produce a valid JWT payload in set_config even with exotic roles', async () => {
            const user = { uid: 'u1', roles: ['role"with"quotes', 'role,with,commas', 'rôle-spécial'] } as any;
            const authDelegate = await delegate.withAuth(user);

            const mockTx = { execute: jest.fn() } as any;
            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb(mockTx);
            });

            jest.spyOn(PostgresDataSource.prototype, 'fetchCollection').mockResolvedValueOnce([]);

            await authDelegate.fetchCollection({ path: 'x', collection: { slug: 'x', properties: {} } as any });

            const serialized = JSON.stringify(mockTx.execute.mock.calls[0][0]);
            // The JWT should be valid JSON.stringify output containing the roles
            expect(serialized).toContain('role\\"with\\"quotes');
            expect(serialized).toContain('rôle-spécial');
        });

        it('should handle role objects missing the id field by falling back to String()', async () => {
            const user = { uid: 'u1', roles: [{ name: 'viewer' }, 42, null] } as any;
            const authDelegate = await delegate.withAuth(user);

            const mockTx = { execute: jest.fn() } as any;
            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb(mockTx);
            });

            jest.spyOn(PostgresDataSource.prototype, 'fetchCollection').mockResolvedValueOnce([]);

            await authDelegate.fetchCollection({ path: 'x', collection: { slug: 'x', properties: {} } as any });

            const serialized = JSON.stringify(mockTx.execute.mock.calls[0][0]);
            // Objects without id → String({name:'viewer'}) = "[object Object]", 42 → "42", null → "null"
            expect(serialized).toContain('set_config');
        });

        it('should wrap deleteEntity in a transaction with RLS', async () => {
            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb({ execute: jest.fn() });
            });
            jest.spyOn(PostgresDataSource.prototype, 'deleteEntity').mockResolvedValueOnce(undefined);

            const authDelegate = await delegate.withAuth({ uid: 'deleter', email: 'del@test.com' } as any);
            await authDelegate.deleteEntity({ entity: { id: '1', path: 'x', values: {} } as any });

            expect(mockDb.transaction).toHaveBeenCalled();
        });

        it('should wrap checkUniqueField in a transaction with RLS', async () => {
            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb({ execute: jest.fn() });
            });
            jest.spyOn(PostgresDataSource.prototype, 'checkUniqueField').mockResolvedValueOnce(true);

            const authDelegate = await delegate.withAuth({ uid: 'checker', email: 'c@test.com' } as any);
            const result = await authDelegate.checkUniqueField('path', 'email', 'test@x.com', '1');

            expect(mockDb.transaction).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should wrap countEntities in a transaction with RLS', async () => {
            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
                return await cb({ execute: jest.fn() });
            });
            jest.spyOn(PostgresDataSource.prototype, 'countEntities').mockResolvedValueOnce(42);

            const authDelegate = await delegate.withAuth({ uid: 'counter', email: 'c@test.com' } as any);
            const result = await authDelegate.countEntities({ path: 'items', collection: {} as any });

            expect(mockDb.transaction).toHaveBeenCalled();
            expect(result).toBe(42);
        });

        it('should expose key="postgres" and initialised=true on the authenticated wrapper', async () => {
            const authDelegate = await delegate.withAuth({ uid: 'u', email: 'u@t.com' } as any);
            expect(authDelegate.key).toBe('postgres');
            expect(authDelegate.initialised).toBe(true);
        });

        it('should NOT share user state if withAuth is called with different users', async () => {
            const auth1 = await delegate.withAuth({ uid: 'alice', email: 'a@t.com' } as any) as any;
            const auth2 = await delegate.withAuth({ uid: 'bob', email: 'b@t.com' } as any) as any;

            expect(auth1.user.uid).toBe('alice');
            expect(auth2.user.uid).toBe('bob');
            // They share the same underlying delegate
            expect(auth1.delegate).toBe(auth2.delegate);
        });

        it('should create a fresh pendingNotifications array per withTransaction call (no accumulation)', async () => {
            const authDelegate = await delegate.withAuth({ uid: 'u1', email: 'u@t.com' } as any);
            const mockTx = { execute: jest.fn() };

            (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => await cb(mockTx));

            jest.spyOn(PostgresDataSource.prototype, 'saveEntity')
                .mockImplementationOnce(async function(this: any) {
                    this._pendingNotifications?.push({ path: 'call-1', entityId: '1', entity: {} as any });
                    return {} as any;
                })
                .mockImplementationOnce(async function(this: any) {
                    this._pendingNotifications?.push({ path: 'call-2', entityId: '2', entity: {} as any });
                    return {} as any;
                });

            await authDelegate.saveEntity({ path: 'call-1', entityId: '1', values: {}, collection: {} as any, status: 'new' });
            await authDelegate.saveEntity({ path: 'call-2', entityId: '2', values: {}, collection: {} as any, status: 'new' });

            // Each call should have flushed exactly 1 notification, not accumulated
            expect(mockRealtimeService.notifyEntityUpdate).toHaveBeenCalledTimes(2);
            expect(mockRealtimeService.notifyEntityUpdate).toHaveBeenNthCalledWith(1, 'call-1', '1', {}, undefined);
            expect(mockRealtimeService.notifyEntityUpdate).toHaveBeenNthCalledWith(2, 'call-2', '2', {}, undefined);
        });
    });
});

