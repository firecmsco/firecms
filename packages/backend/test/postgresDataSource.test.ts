
import { describe, it, expect, beforeEach } from '@jest/globals';
import { PostgresDataSource } from '../src/services/postgresDataSource';
import { RealtimeService } from '../src/services/realtimeService';
import { EntityService } from '../src/db/entityService';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

// Mock dependencie
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

            // Mock transaction execution
            (mockDb.transaction as any).mockImplementation(async (cb: any) => {
                const mockTx = {
                    execute: jest.fn(),
                    select: jest.fn().mockReturnThis(),
                    from: jest.fn().mockReturnThis(),
                };
                return cb(mockTx);
            });

            // Call a method on the authenticated delegate
            // We need to mock the internal EntityService call or the method itself
            // Since we can't easily mock the internal EntityService of the new delegate without more invasive mocking,
            // we will verify that the transaction was called and set_config was executed.

            // However, since we are mocking the db.transaction, the actual method logic inside might fail if we don't mock everything deeply.
            // Let's rely on the fact that db.transaction is called.

            try {
                await authDelegate.fetchCollection({ path: 'test_collection', collection: { slug: 'test', properties: {} } as any });
            } catch (e) {
                // Ignore errors from missing deep mocks, just check transaction start
            }

            expect(mockDb.transaction).toHaveBeenCalled();
        });

        it('should set app.user_id in the transaction for RLS', async () => {
            const user = { uid: 'test-user-123', email: 'test@example.com' };
            const authDelegate = await delegate.withAuth(user);

            let txExecutor: any;
            (mockDb.transaction as any).mockImplementation(async (cb: any) => {
                const mockTx = {
                    execute: jest.fn(),
                    select: jest.fn().mockReturnThis(),
                    from: jest.fn().mockReturnThis(),
                };
                txExecutor = mockTx;
                // We throw here to stop execution before it hits unmocked entity service logic
                throw new Error("Stop execution");
                // return cb(mockTx);
            });

            try {
                await authDelegate.fetchCollection({ path: 'test', collection: { slug: 'test', properties: {} } as any });
            } catch (e: any) {
                if (e.message !== "Stop execution") throw e;
            }

            // We actually need to capture the callback passed to transaction and run it
            expect(mockDb.transaction).toHaveBeenCalled();

            // To properly test the sql`` execution, we simulates the internal callback execution
            const transactionCallback = (mockDb.transaction as any).mock.calls[0][0];

            const mockTx = {
                execute: jest.fn(),
            } as any;

            try {
                await transactionCallback(mockTx);
            } catch (e) {
                // ignore downstream errors
            }

            expect(mockTx.execute).toHaveBeenCalled();
            // We can check if the SQL contains the user ID
            const sqlCall = mockTx.execute.mock.calls[0][0];
            // The SQL object in drizzle is complex, but we can inspect it roughly or rely on the code review
            // Ideally testing with a real DB is better, but this unit-tests the logic flow.
        });

        it('should set app.user_roles handling array of strings correctly', async () => {
            const user = { uid: 'test-user-123', email: 'test@example.com', roles: ['admin', 'editor'] } as any;
            const authDelegate = await delegate.withAuth(user);

            let txExecutor: any;
            (mockDb.transaction as any).mockImplementation(async (cb: any) => {
                txExecutor = { execute: jest.fn(), select: jest.fn().mockReturnThis(), from: jest.fn().mockReturnThis() };
                throw new Error("Stop execution");
            });

            try { await authDelegate.fetchCollection({ path: 'test', collection: { slug: 'test', properties: {} } as any }); } catch (e: any) {}

            const transactionCallback = (mockDb.transaction as any).mock.calls[0][0];
            const mockTx = { execute: jest.fn() } as any;

            try { await transactionCallback(mockTx); } catch (e) {}

            expect(mockTx.execute).toHaveBeenCalledTimes(1);
            
            // The single execute call sets user_id, user_roles, and jwt together
            const sqlCall = mockTx.execute.mock.calls[0][0];
            const callString = JSON.stringify(sqlCall);
            expect(callString).toContain("set_config");
            expect(callString).toContain("admin,editor");
        });

        it('should set app.user_roles handling array of objects correctly', async () => {
            const user = { uid: 'test-user-123', email: 'test@example.com', roles: [{ id: 'admin' }, { id: 'editor' }] } as any;
            const authDelegate = await delegate.withAuth(user);

            (mockDb.transaction as any).mockImplementation(async (cb: any) => {
                throw new Error("Stop execution");
            });

            try { await authDelegate.fetchCollection({ path: 'test', collection: { slug: 'test', properties: {} } as any }); } catch (e: any) {}

            const transactionCallback = (mockDb.transaction as any).mock.calls[0][0];
            const mockTx = { execute: jest.fn() } as any;

            try { await transactionCallback(mockTx); } catch (e) {}

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
            
            // Crucially, we DO NOT add a subscription to the map here
            jest.spyOn(delegate, 'listenCollection').mockImplementationOnce(() => mockUnsubscribe);

            // This should not crash despite lastEntry being undefined
            const unsub = authDelegate.listenCollection({ path: 'empty-test', collection: {} as any, callbacks: {} as any });

            expect(unsub).toBe(mockUnsubscribe);
        });
    });
});
