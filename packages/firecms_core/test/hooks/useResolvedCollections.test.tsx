/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useResolvedCollections } from "../../src/hooks/navigation/useResolvedCollections";
import { AuthController, CollectionRegistryController, DataSource, EntityCollection } from "@firecms/types";
import { CollectionRegistry } from "@firecms/common";
import { jest } from "@jest/globals";

describe("useResolvedCollections", () => {

    const mockDataSource: DataSource = {} as DataSource;
    
    const mockCollectionRegistry = new CollectionRegistry();
    jest.spyOn(mockCollectionRegistry, "registerMultiple").mockReturnValue(true);

    const mockCollectionRegistryController: CollectionRegistryController<any> & { collectionRegistryRef: React.MutableRefObject<CollectionRegistry> } = {
        collectionRegistryRef: { current: mockCollectionRegistry },
        getCollection: jest.fn(),
        getCollections: jest.fn(),
    } as any;

    it("should resolve a static array of collections and register them", async () => {
        const mockAuthController = {
            initialLoading: false,
            user: { uid: "test-user" }
        } as unknown as AuthController;

        const mockCollections: EntityCollection[] = [
            { id: "test", name: "Test Collection", path: "test" }
        ];

        const { result } = renderHook(() => useResolvedCollections({
            authController: mockAuthController,
            collections: mockCollections,
            dataSource: mockDataSource,
            collectionRegistryController: mockCollectionRegistryController,
        }));

        expect(result.current.loading).toBe(true);
        expect(result.current.collections).toEqual([]);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.collections).toEqual(mockCollections);
        expect(mockCollectionRegistry.registerMultiple).toHaveBeenCalledWith(mockCollections);
    });

    it("should resolve an async collection builder", async () => {
        const mockAuthController = {
            initialLoading: false,
            user: { uid: "test-user" }
        } as unknown as AuthController;

        const mockCollections: EntityCollection[] = [
            { id: "dynamic", name: "Dynamic", path: "dynamic" }
        ];

        const builder = jest.fn().mockResolvedValue(mockCollections);

        const { result } = renderHook(() => useResolvedCollections({
            authController: mockAuthController,
            collections: builder,
            dataSource: mockDataSource,
            collectionRegistryController: mockCollectionRegistryController,
        }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(builder).toHaveBeenCalledWith({
            user: mockAuthController.user,
            authController: mockAuthController,
            dataSource: mockDataSource
        });
        expect(result.current.collections).toEqual(mockCollections);
    });

    it("should wait while auth is initially loading before resolving", async () => {
        let authLoading = true;
        const mockAuthController: any = {
            get initialLoading() { return authLoading; },
            user: null
        };

        const mockCollections: EntityCollection[] = [{ id: "test", name: "Test", path: "test" }];

        const { result, rerender } = renderHook(() => useResolvedCollections({
            authController: mockAuthController,
            collections: mockCollections,
            dataSource: mockDataSource,
            collectionRegistryController: mockCollectionRegistryController,
        }));

        // While authLoading is true, it should exit early and loading should be true
        expect(result.current.loading).toBe(true);
        expect(result.current.collections).toEqual([]);

        // Rerender doesn't trigger effect re-run unless dependencies change
        rerender();
        
        expect(result.current.loading).toBe(true);
        expect(result.current.collections).toEqual([]);

        // Now mock auth loading finished
        authLoading = false;
        mockAuthController.user = { uid: "test-user" };
        
        rerender();

        // The dependency `initialLoading` changed, so the effect should run
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.collections).toEqual(mockCollections);
    });

    it("should capture errors during resolution", async () => {
        const mockAuthController = {
            initialLoading: false,
            user: { uid: "test-user" }
        } as unknown as AuthController;

        const builder = jest.fn().mockRejectedValue(new Error("Failed to load collections"));

        // Suppress console.error for this expected error test
        const originalError = console.error;
        console.error = jest.fn();

        const { result } = renderHook(() => useResolvedCollections({
            authController: mockAuthController,
            collections: builder,
            dataSource: mockDataSource,
            collectionRegistryController: mockCollectionRegistryController,
        }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("Failed to load collections");
        
        console.error = originalError;
    });
});
