/**
 * @jest-environment jsdom
 */
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EntityCollection, FireCMSPlugin } from "../src/types";
import { filterPausedPlugins, isProPaused, PRO_PLUGIN_KEYS } from "../src/core/pro_plugins";
import { useBuildNavigationController } from "../src/hooks/useBuildNavigationController";
import { publishLicenseStatus } from "../src/contexts/LicenseStatusContext";

/**
 * A lapsed license used to replace the whole CMS with a "License needed" screen.
 * Now only the PRO plugins pause, and they have to pause completely: plugins
 * contribute in two places, inside `FireCMS` (providers, form and collection
 * view actions) and in `useBuildNavigationController`, which the app calls
 * above `FireCMS` and which applies collection modifications, injected
 * collections, views and navigation entries. These cover the rule and the
 * navigation layer; `license_check_firecms.test.tsx` covers `FireCMS`.
 */

const plugin = (key: string, extra: Partial<FireCMSPlugin> = {}): FireCMSPlugin => ({ key, ...extra });

afterEach(() => {
    act(() => publishLicenseStatus(null));
});

describe("filterPausedPlugins", () => {

    const all = [
        "collection_editor", "user_management", "import_export", "import", "export",
        "entity_history", "data_enhancement", "datatalk", "media_manager", "firebase_admin", "my_custom_plugin"
    ].map(key => plugin(key));

    it("lists the PRO plugins the backend licenses", () => {
        expect([...PRO_PLUGIN_KEYS].sort()).toEqual([
            "collection_editor", "data_enhancement", "datatalk", "entity_history",
            "export", "import", "import_export", "user_management"
        ]);
    });

    it.each(["expired", "invalid_project", "over_quota", undefined])(
        "keeps user_management and non-PRO plugins, drops the rest, when blocked (%s)",
        (licenseState) => {
            const kept = filterPausedPlugins(all, { blocked: true, licenseState: licenseState as any })!;
            expect(kept.map(p => p.key)).toEqual(["user_management", "media_manager", "firebase_admin", "my_custom_plugin"]);
        });

    it.each([
        ["not blocked", { blocked: false, licenseState: "trial" as const, daysLeft: 3 }],
        ["an old server's allowed response", { blocked: false }],
        ["no answer", null]
    ])("filters nothing and returns the same array when %s", (_, status) => {
        expect(filterPausedPlugins(all, status)).toBe(all);
        expect(isProPaused(status)).toBe(false);
    });

    it("returns the same array when blocked but nothing is PRO", () => {
        const community = [plugin("media_manager"), plugin("my_custom_plugin")];
        expect(filterPausedPlugins(community, { blocked: true, licenseState: "expired" })).toBe(community);
    });

    it("passes an absent plugin list through", () => {
        expect(filterPausedPlugins(undefined, { blocked: true })).toBeUndefined();
    });
});

describe("useBuildNavigationController while PRO is paused", () => {

    const baseCollections: EntityCollection[] = [
        { id: "products", name: "Products", path: "products", properties: {} },
        { id: "orders", name: "Orders", path: "orders", properties: {} }
    ];

    // Shaped after what the real plugins contribute at this level.
    const entityHistory = plugin("entity_history", {
        collection: {
            modifyCollection: (collection) => ({
                ...collection,
                history: true,
                entityViews: [...(collection.entityViews ?? []), { key: "__history", name: "History", Builder: () => null }]
            })
        }
    });
    const onNavigationEntriesUpdate = jest.fn();
    const collectionEditor = plugin("collection_editor", {
        homePage: {
            allowDragAndDrop: true,
            navigationEntries: [{ name: "Saved by the editor", entries: ["products"] }],
            onNavigationEntriesUpdate
        },
        collection: {
            injectCollections: (collections) => [...collections, { id: "injected", name: "Injected", path: "injected", properties: {} }]
        }
    });
    const datatalk = plugin("datatalk", { views: [{ path: "datatalk", name: "DataTalk", view: <div/> }] });
    const userManagement = plugin("user_management", { views: [{ path: "kept_view", name: "Kept", view: <div/> }] });
    const custom = plugin("my_custom_plugin", {
        collection: { modifyCollection: (collection) => ({ ...collection, description: "custom" }) }
    });

    const plugins = [userManagement, entityHistory, collectionEditor, datatalk, custom];

    const wrapper = ({ children }: { children?: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;
    const authController = { user: null, initialLoading: false } as any;
    const dataSourceDelegate = { key: "test", initialised: true } as any;

    const groupOf = (nav: any, path: string) =>
        nav.topLevelNavigation?.navigationEntries.find((e: any) => e.path === path)?.group;

    function build(collections: EntityCollection[] | (() => Promise<EntityCollection[]> | EntityCollection[]) = baseCollections) {
        return renderHook(() => useBuildNavigationController({
            collections,
            plugins,
            authController,
            dataSourceDelegate
        }), { wrapper }).result;
    }

    it("applies every plugin's contributions while nothing is paused", async () => {
        const result = build();
        await waitFor(() => expect(result.current.initialised).toBe(true));

        expect(result.current.getCollection("products")?.history).toBe(true);
        expect(result.current.getCollection("products")?.description).toBe("custom");
        expect(result.current.collections?.map(c => c.id)).toContain("injected");
        expect(result.current.views?.map(v => v.path)).toEqual(["kept_view", "datatalk"]);
        expect(result.current.topLevelNavigation?.allowDragAndDrop).toBe(true);
        expect(groupOf(result.current, "products")).toBe("Saved by the editor");
    });

    it("drops the paused plugins' contributions when the status arrives, and keeps the rest", async () => {
        const result = build();
        await waitFor(() => expect(result.current.initialised).toBe(true));

        act(() => publishLicenseStatus({ blocked: true, licenseState: "expired" }));

        await waitFor(() => expect(result.current.getCollection("products")?.history).toBeUndefined());
        expect(result.current.getCollection("products")?.entityViews ?? []).toEqual([]);
        // Sorted: `getCollection` reorders the list in place.
        expect(result.current.collections?.map(c => c.id).sort()).toEqual(["orders", "products"]);
        expect(result.current.views?.map(v => v.path)).toEqual(["kept_view"]);
        expect(result.current.topLevelNavigation?.allowDragAndDrop).toBe(false);
        expect(groupOf(result.current, "products")).not.toBe("Saved by the editor");
        expect(result.current.topLevelNavigation?.navigationEntries.map((e: any) => e.path))
            .not.toContain("datatalk");

        // Non-PRO plugins and user_management keep contributing.
        expect(result.current.getCollection("products")?.description).toBe("custom");

        // FireCMS reads the plugins from here, and sends every key to the license check.
        expect(result.current.plugins?.map(p => p.key)).toEqual(plugins.map(p => p.key));
    });

    it("restores them when the pause lifts", async () => {
        act(() => publishLicenseStatus({ blocked: true, licenseState: "invalid_project" }));
        const result = build();
        await waitFor(() => expect(result.current.initialised).toBe(true));
        expect(result.current.getCollection("products")?.history).toBeUndefined();

        act(() => publishLicenseStatus({ blocked: false, licenseState: "licensed" }));

        await waitFor(() => expect(result.current.getCollection("products")?.history).toBe(true));
        expect(result.current.topLevelNavigation?.allowDragAndDrop).toBe(true);
    });

    it("does not let a resolution started before the pause overwrite the paused one", async () => {
        let release: (() => void) | undefined;
        let calls = 0;
        const collections = () => {
            calls++;
            if (calls === 1) {
                // The first resolution, started before the license status arrived, is slow.
                return new Promise<EntityCollection[]>(resolve => {
                    release = () => resolve(baseCollections);
                });
            }
            return baseCollections;
        };

        // Every render's view of the collections: a stale write shows up here even
        // when a later resolution repairs it.
        const rendered: string[][] = [];
        const { result } = renderHook(() => {
            const navigation = useBuildNavigationController({
                collections,
                plugins,
                authController,
                dataSourceDelegate
            });
            rendered.push((navigation.collections ?? []).map(c => c.history ? `${c.id}+history` : c.id));
            return navigation;
        }, { wrapper });
        await waitFor(() => expect(release).toBeDefined());
        // The first resolution has not landed, so nothing rendered so far has collections.
        const pausedFrom = rendered.length;

        act(() => publishLicenseStatus({ blocked: true, licenseState: "expired" }));
        await waitFor(() => expect(result.current.initialised).toBe(true));

        await act(async () => {
            release!();
            await new Promise(resolve => setTimeout(resolve, 20));
        });

        const afterPause = rendered.slice(pausedFrom).flat();
        expect(afterPause.length).toBeGreaterThan(0);
        expect(afterPause.filter(id => id.endsWith("+history") || id === "injected")).toEqual([]);
    });

    it("updates the home page when a paused plugin only contributed grouping and drag and drop", async () => {
        const groupingOnly = plugin("collection_editor", {
            homePage: {
                allowDragAndDrop: true,
                navigationEntries: [{ name: "Saved by the editor", entries: ["products", "orders"] }]
            }
        });
        const stablePlugins = [groupingOnly];
        const { result } = renderHook(() => useBuildNavigationController({
            collections: baseCollections,
            plugins: stablePlugins,
            authController,
            dataSourceDelegate
        }), { wrapper });
        await waitFor(() => expect(result.current.topLevelNavigation?.allowDragAndDrop).toBe(true));
        expect(groupOf(result.current, "products")).toBe("Saved by the editor");

        act(() => publishLicenseStatus({ blocked: true, licenseState: "expired" }));

        // Same collections, views and order: only the pause says the navigation changed.
        await waitFor(() => expect(result.current.topLevelNavigation?.allowDragAndDrop).toBe(false));
        expect(groupOf(result.current, "products")).not.toBe("Saved by the editor");
    });

    it("never calls a paused plugin's navigation-order callback", async () => {
        onNavigationEntriesUpdate.mockClear();
        act(() => publishLicenseStatus({ blocked: true, licenseState: "expired" }));
        const result = build();
        await waitFor(() => expect(result.current.topLevelNavigation).toBeDefined());

        act(() => result.current.topLevelNavigation!.onNavigationEntriesUpdate([{ name: "G", entries: ["orders", "products"] }]));

        expect(onNavigationEntriesUpdate).not.toHaveBeenCalled();
    });
});
