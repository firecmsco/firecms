/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from "@testing-library/react";
import { useResolvedViews } from "../../src/hooks/navigation/useResolvedViews";
import { AuthController, AppView, DataDriver } from "@rebasepro/types";
import { jest } from "@jest/globals";

describe("useResolvedViews", () => {

    const mockDataDriver: DataDriver = {} as DataDriver;

    it("should resolve views array and set loading to false", async () => {
        // ... (auth controller and collections setup identical to useResolvedCollections test, but testing views) ...
        const mockAuthController = {
            initialLoading: false,
            user: { uid: "test-user" }
        } as unknown as AuthController;

        const mockViews: AppView[] = [
            { name: "My View", slug: "my-view", view: null! }
        ];

        const { result } = renderHook(() => useResolvedViews({
            authController: mockAuthController,
            views: mockViews,
            driver: mockDataDriver,
        }));

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.views).toEqual(mockViews);
        expect(result.current.adminViews).toEqual([]);
    });

    it("should wait while auth is initially loading", async () => {
        let authLoading = true;
        const mockAuthController: Partial<AuthController> & { initialLoading: boolean; user: { uid: string } | null } = {
            get initialLoading() { return authLoading; },
            user: null
        };

        const { result, rerender } = renderHook(() => useResolvedViews({
            authController: mockAuthController,
            views: [],
            driver: mockDataDriver,
        }));

        expect(result.current.loading).toBe(true);

        authLoading = false;
        mockAuthController.user = { uid: "test-user" };

        rerender();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.views).toEqual([]);
    });

    it("should inject Users and Roles admin views if userManagement is true", async () => {
        const mockAuthController = {
            initialLoading: false,
            user: { uid: "test-user" }
        } as unknown as AuthController;

        const userManagementActive: { roles: boolean; users: boolean } = {
            roles: true,
            users: true
        };

        const { result } = renderHook(() => useResolvedViews({
            authController: mockAuthController,
            views: undefined,
            userManagement: userManagementActive,
            driver: mockDataDriver,
        }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const activeAdminViews = result.current.adminViews!;
        expect(activeAdminViews).toHaveLength(2);
        expect(activeAdminViews.find(v => v.slug === "users")).toBeDefined();
        expect(activeAdminViews.find(v => v.slug === "roles")).toBeDefined();
    });
});
