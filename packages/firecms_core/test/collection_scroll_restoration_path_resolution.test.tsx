/**
 * @jest-environment jsdom
 */
import { afterEach, describe, expect, it, jest } from "@jest/globals";

/**
 * The scroll restoration cache was read under one key and written under another.
 *
 * `useScrollRestoration` keys its Map by `createCacheKey(fullPath, filters)`. The controller
 * wrote through it with `resolvedPath` (`onScroll` and the mount seeding effect) but read it
 * back with the raw `fullPath` prop. Those two agree only while `resolveIdsFrom` is the
 * identity, which is precisely the case a test with an identity mock cannot distinguish —
 * so this file gives the navigation controller a real alias map.
 *
 * Wherever they differ (a collection reached through an id alias, a subcollection whose
 * parent ids need resolving) the entry was stored under the resolved key and looked up under
 * the unresolved one, so it was never found: scroll position was lost and the item count fell
 * back to a single page, silently, for those collections only.
 *
 * `resolvedPath` is the correct key. What the cache holds is a slice of a dataset plus an
 * offset into it, and the dataset is identified by what the datasource was queried with.
 */

const listened: any[] = [];

let nextEntities: any[] = [];

const dataSource = {
    listenCollection: (p: any) => {
        listened.push(p);
        p.onUpdate(nextEntities);
        return () => undefined;
    }
};

/**
 * A collection id that resolves to a different real path. Any segment carrying the suffix
 * resolves by dropping it, so each test can name its own collection: the scroll cache is a
 * module level Map shared by every test in this file, exactly as it is shared by every
 * collection in a running app, and there is no seam to clear it between tests.
 */
const ALIAS_SUFFIX = "_alias";

const resolveIdsFrom = (path: string) =>
    path
        .split("/")
        .map((segment) => segment.endsWith(ALIAS_SUFFIX) ? segment.slice(0, -ALIAS_SUFFIX.length) : segment)
        .join("/");

jest.mock("../src/hooks/data/useDataSource", () => ({ useDataSource: () => dataSource }));
jest.mock("../src/hooks/useNavigationController", () => ({
    // Deliberately NOT the identity: this is the whole point of the file.
    useNavigationController: () => ({ resolveIdsFrom })
}));
jest.mock("../src/hooks/useFireCMSContext", () => ({ useFireCMSContext: () => ({}) }));

import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useDataSourceTableController } from "../src/components/common/useDataSourceTableController";
import { useScrollRestoration } from "../src/components/common/useScrollRestoration";

/** The controller reads the location to sync filters into the URL. */
const Router = ({ children }: { children?: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

const DEFAULT_PAGE_SIZE = 50;

const makeCollection = (path: string, extra: Record<string, any> = {}) => ({
    id: path,
    path,
    name: path,
    properties: {
        title: { dataType: "string", name: "Title" }
    },
    ...extra
}) as any;

const entities = (count: number, path: string) =>
    Array.from({ length: count }, (_, i) => ({ id: `${i}`, path, values: {} }));

/**
 * `useScrollRestoration` is a pair of closures over a module level Map, so calling it here
 * gives the same shared cache the app uses — and surviving the unmount is the point.
 */
const scrollRestoration = useScrollRestoration();

const mount = (fullPath: string, collection: any, extra: Record<string, any> = {}) =>
    renderHook(
        () => useDataSourceTableController({
            fullPath,
            collection,
            scrollRestoration,
            ...extra
        }),
        { wrapper: Router }
    );

const lastCall = () => listened[listened.length - 1];

afterEach(() => {
    listened.length = 0;
    nextEntities = [];
});

describe("scroll restoration across path resolution", () => {

    it("restores offset and item count for a collection reached through an id alias", async () => {
        const ALIAS = "products_alias";
        const collection = makeCollection(ALIAS);
        nextEntities = entities(80, "products");

        const first = mount(ALIAS, collection);
        await waitFor(() => expect(first.result.current.data).toHaveLength(80));
        // The datasource is queried with the resolved path, never the alias.
        expect(lastCall().path).toBe("products");

        act(() => first.result.current.onScroll({ scrollOffset: 600 }));
        first.unmount();

        // Navigating back. Before the fix this read `getCollectionScroll("products_alias")`,
        // found nothing, and started over at one page from the top.
        const second = mount(ALIAS, collection);
        await waitFor(() => expect(listened.length).toBe(2));

        expect(second.result.current.initialScroll).toBe(600);
        expect(second.result.current.itemCount).toBe(80);
        expect(lastCall().limit).toBe(80);
        second.unmount();
    });

    it("stores one entry, under the resolved path", async () => {
        const ALIAS = "invoices_alias";
        const collection = makeCollection(ALIAS);
        nextEntities = entities(30, "invoices");

        const { result, unmount } = mount(ALIAS, collection);
        await waitFor(() => expect(result.current.data).toHaveLength(30));
        act(() => result.current.onScroll({ scrollOffset: 120 }));
        unmount();

        expect(scrollRestoration.getCollectionScroll("invoices")?.scrollOffset).toBe(120);
        // No second entry under the name the route happened to use to get here.
        expect(scrollRestoration.getCollectionScroll(ALIAS)).toBeUndefined();
    });

    it("shares one entry between the alias and the real path", async () => {
        // Same underlying data, two ways in. They must not each keep their own scroll.
        const aliased = makeCollection("customers_alias");
        nextEntities = entities(65, "customers");

        const first = mount("customers_alias", aliased);
        await waitFor(() => expect(first.result.current.data).toHaveLength(65));
        act(() => first.result.current.onScroll({ scrollOffset: 340 }));
        first.unmount();

        const direct = makeCollection("customers");
        const second = mount("customers", direct);
        await waitFor(() => expect(listened.length).toBe(2));

        expect(second.result.current.initialScroll).toBe(340);
        expect(lastCall().limit).toBe(65);
        second.unmount();
    });

    it("restores a subcollection whose parent path needs resolving", async () => {
        // Only the first and last segments are aliases; the entity id in between is not.
        const ALIAS_PATH = "products_alias/prod_1/locales_alias";
        const RESOLVED = "products/prod_1/locales";
        const collection = makeCollection("locales_alias");
        nextEntities = entities(12, RESOLVED);

        const first = mount(ALIAS_PATH, collection, { pathSegments: ["products_alias", "prod_1", "locales_alias"] });
        await waitFor(() => expect(first.result.current.data).toHaveLength(12));
        expect(lastCall().path).toBe(RESOLVED);

        act(() => first.result.current.onScroll({ scrollOffset: 90 }));
        first.unmount();

        const second = mount(ALIAS_PATH, collection, { pathSegments: ["products_alias", "prod_1", "locales_alias"] });
        await waitFor(() => expect(listened.length).toBe(2));

        expect(second.result.current.initialScroll).toBe(90);
        expect(lastCall().limit).toBe(12);
        second.unmount();
    });

    it("keeps distinct filters in distinct entries", async () => {
        // The key is path AND filters. Moving the read onto the resolved path must not
        // collapse two filter states of the same collection into one.
        const collection = makeCollection("tickets_alias");
        const filtered = { title: ["==", "a"] } as any;

        nextEntities = entities(70, "tickets");
        const unfilteredMount = mount("tickets_alias", collection);
        await waitFor(() => expect(unfilteredMount.result.current.data).toHaveLength(70));
        act(() => unfilteredMount.result.current.onScroll({ scrollOffset: 500 }));
        unfilteredMount.unmount();

        nextEntities = entities(9, "tickets");
        const filteredMount = mount("tickets_alias", makeCollection("tickets_alias", { initialFilter: filtered }));
        await waitFor(() => expect(filteredMount.result.current.data).toHaveLength(9));

        // A filtered view starts at the top with its own page, not at the offset the
        // unfiltered one left behind.
        expect(filteredMount.result.current.initialScroll).toBeUndefined();
        expect(lastCall().limit).toBe(DEFAULT_PAGE_SIZE);
        filteredMount.unmount();

        expect(scrollRestoration.getCollectionScroll("tickets")?.scrollOffset).toBe(500);
    });

    it("does not confuse two different collections that share a prefix", async () => {
        nextEntities = entities(40, "catalog");
        const first = mount("catalog_alias", makeCollection("catalog_alias"));
        await waitFor(() => expect(first.result.current.data).toHaveLength(40));
        act(() => first.result.current.onScroll({ scrollOffset: 220 }));
        first.unmount();

        nextEntities = [];
        // Resolves to itself: a neighbour of "catalog", not the same entry.
        const other = mount("catalog_archive", makeCollection("catalog_archive"));
        await waitFor(() => expect(listened.length).toBe(2));

        expect(other.result.current.initialScroll).toBeUndefined();
        expect(lastCall().limit).toBe(DEFAULT_PAGE_SIZE);
        other.unmount();
    });

});
