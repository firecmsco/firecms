/**
 * @jest-environment jsdom
 */
import { TextEncoder, TextDecoder } from "util";
Object.assign(global, { TextDecoder, TextEncoder });

import { renderHook, waitFor, act } from "@testing-library/react";
import { useBuildNavigationStateController } from "../../src/hooks/navigation/useBuildNavigationStateController";
import { AuthController, UrlController, CollectionRegistryController, DataDriver, EntityCollection } from "@rebasepro/types";
import { CollectionRegistry } from "@rebasepro/common";
import { jest } from "@jest/globals";

describe("useBuildNavigationStateController", () => {

    const mockDataDriver: DataDriver = {} as DataDriver;

    const mockCollectionRegistry = new CollectionRegistry();
    jest.spyOn(mockCollectionRegistry, "registerMultiple").mockReturnValue(true);

    const mockCollectionRegistryController = {
        collectionRegistryRef: { current: mockCollectionRegistry },
        getCollection: jest.fn(),
        getCollections: jest.fn(),
    } as Partial<CollectionRegistryController> as CollectionRegistryController & { collectionRegistryRef: React.MutableRefObject<CollectionRegistry> };

    const mockCmsUrlController = {
        buildUrlCollectionPath: (path: string) => `/c/${path}`,
        buildAppUrlPath: (path: string) => `/${path}`,
        basePath: "/",
        baseCollectionPath: "/c",
    } as Partial<UrlController> as UrlController;

    it("should aggregate loading states from collections and views", async () => {
        let authLoading = true;
        const mockAuthController = {
            get initialLoading() { return authLoading; },
            user: null
        } as unknown as AuthController;

        const { result, rerender } = renderHook(() => useBuildNavigationStateController({
            authController: mockAuthController,
            collections: [],
            views: undefined,
            driver: mockDataDriver,
            collectionRegistryController: mockCollectionRegistryController,
            urlController: mockCmsUrlController
        }));

        // Initially loading because auth is loading
        expect(result.current.loading).toBe(true);

        // Turn off auth loading
        authLoading = false;
        (mockAuthController as { user: { uid: string } | null }).user = { uid: "test" };

        rerender();

        // Eventually both collections and views promise resolution finishes
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.topLevelNavigation).toBeDefined();
        // Since both were empty, it should have 0 entries
        expect(result.current.topLevelNavigation?.navigationEntries).toHaveLength(0);
    });

    it("should expose a single combined refreshNavigation method", async () => {
        const mockAuthController = {
            initialLoading: false,
            user: { uid: "test" }
        } as unknown as AuthController;

        const { result } = renderHook(() => useBuildNavigationStateController({
            authController: mockAuthController,
            collections: [],
            views: undefined,
            driver: mockDataDriver,
            collectionRegistryController: mockCollectionRegistryController,
            urlController: mockCmsUrlController
        }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Calling refreshNavigation shouldn't throw, and it should trigger the sub-hooks
        expect(typeof result.current.refreshNavigation).toBe("function");

        // This is mostly a sanity check that the refresh propagates without errors
        let refreshPromise: unknown;
        act(() => {
            refreshPromise = result.current.refreshNavigation();
        });
        expect(refreshPromise).toBeUndefined(); // It's void
    });

    it("should aggregate error states if collections fail", async () => {
        const mockAuthController = {
            initialLoading: false,
            user: { uid: "test" }
        } as unknown as AuthController;

        const badBuilder = jest.fn().mockRejectedValue(new Error("Collection builder error"));

        // Suppress console.error for this expected error test
        const originalError = console.error;
        console.error = jest.fn();

        const { result } = renderHook(() => useBuildNavigationStateController({
            authController: mockAuthController,
            collections: badBuilder,
            views: undefined,
            driver: mockDataDriver,
            collectionRegistryController: mockCollectionRegistryController,
            urlController: mockCmsUrlController
        }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.navigationLoadingError).toBeInstanceOf(Error);
        expect(result.current.navigationLoadingError?.message).toBe("Collection builder error");

        console.error = originalError;
    });
});
