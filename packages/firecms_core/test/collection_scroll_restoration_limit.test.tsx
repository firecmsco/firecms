/**
 * @jest-environment jsdom
 */
import { afterEach, describe, expect, it, jest } from "@jest/globals";

/**
 * A user with a custom datasource reported that the `limit` reaching their datasource was
 * there sometimes and missing other times, depending on which collection they came from.
 *
 * The cause was the scroll restoration cache, a module level Map that outlives any mount.
 * The controller seeded it on mount with whatever `rawData` held at that moment, which for
 * a collection that had not loaded (or had never been scrolled) is `[]`. The next mount of
 * the same collection read that entry back as `data.length === 0` and, through `??`, used
 * it as the initial item count, so the datasource was called with `limit: 0`. Custom
 * datasources typically apply the limit as `if (limit) query.limit(limit)`, so a 0 is
 * falsy, silently dropped, and the whole collection is loaded.
 *
 * These tests drive the controller against a recording datasource across mounts, which is
 * the only place the bug is visible: every unit level assertion about a single mount passed
 * while this was broken.
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

jest.mock("../src/hooks/data/useDataSource", () => ({ useDataSource: () => dataSource }));
jest.mock("../src/hooks/useNavigationController", () => ({
    // Identity: these tests are about the item count, not id-to-path resolution.
    useNavigationController: () => ({ resolveIdsFrom: (p: string) => p })
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
    properties: {},
    ...extra
}) as any;

const entities = (count: number, path: string) =>
    Array.from({ length: count }, (_, i) => ({ id: `${i}`, path, values: {} }));

/**
 * Mounts the controller the way a route does, with a scroll restoration controller that
 * survives the unmount, and returns a `remount` that stands for navigating away and back.
 */
function mountController(collection: any) {
    // useScrollRestoration holds no state of its own: it is a pair of closures over a
    // module level Map, so calling it here gives the same shared cache the app uses, and
    // that cache is exactly what has to survive the unmount below.
    const scrollRestoration = useScrollRestoration();
    const render = () => renderHook(
        () => useDataSourceTableController({
            fullPath: collection.path,
            collection,
            scrollRestoration
        }),
        { wrapper: Router }
    );
    return { scrollRestoration, render };
}

const lastLimit = () => listened[listened.length - 1]?.limit;

afterEach(() => {
    listened.length = 0;
    nextEntities = [];
});

describe("scroll restoration and the datasource limit", () => {

    it("does not seed the cache for a collection that loaded nothing", async () => {
        const collection = makeCollection("empty_collection");
        const { scrollRestoration, render } = mountController(collection);

        const { unmount } = render();
        await waitFor(() => expect(listened.length).toBe(1));
        unmount();

        // The poisoned entry was `{ scrollOffset: 0, data: [] }`. There is nothing to
        // restore for a collection that never showed a row, so nothing should be stored.
        expect(scrollRestoration.getCollectionScroll(collection.path)).toBeUndefined();
    });

    it("asks for the page size again when the collection is re-entered", async () => {
        const collection = makeCollection("revisited_collection");
        const { render } = mountController(collection);

        const first = render();
        await waitFor(() => expect(listened.length).toBe(1));
        expect(lastLimit()).toBe(DEFAULT_PAGE_SIZE);
        first.unmount();

        // Navigating back to a collection that was visited but never scrolled. This is the
        // mount that used to ask for `limit: 0`.
        const second = render();
        await waitFor(() => expect(listened.length).toBe(2));
        expect(lastLimit()).toBe(DEFAULT_PAGE_SIZE);
        second.unmount();
    });

    it("never asks the datasource for a falsy limit while pagination is on", async () => {
        const collection = makeCollection("never_zero_collection");
        const { render } = mountController(collection);

        for (let i = 0; i < 3; i++) {
            const { unmount } = render();
            await waitFor(() => expect(listened.length).toBe(i + 1));
            unmount();
        }

        expect(listened).toHaveLength(3);
        for (const call of listened) {
            expect(call.limit).toBeTruthy();
            expect(call.limit).toBe(DEFAULT_PAGE_SIZE);
        }
    });

    it("still restores the loaded item count and offset after a scroll", async () => {
        const collection = makeCollection("scrolled_collection");
        nextEntities = entities(120, collection.path);
        const { render } = mountController(collection);

        const first = render();
        await waitFor(() => expect(first.result.current.data).toHaveLength(120));

        // Scrolling is what writes real data into the cache.
        act(() => first.result.current.onScroll({ scrollOffset: 800 }));
        first.unmount();

        const second = render();
        await waitFor(() => expect(listened.length).toBe(2));

        // The point of the cache: come back to everything that was loaded, not one page.
        expect(lastLimit()).toBe(120);
        expect(second.result.current.initialScroll).toBe(800);
        expect(second.result.current.itemCount).toBe(120);
        second.unmount();
    });

    it("keeps the limit unset when pagination is disabled", async () => {
        const collection = makeCollection("unpaginated_collection", { pagination: false });
        const { render } = mountController(collection);

        const { result, unmount } = render();
        await waitFor(() => expect(listened.length).toBe(1));

        expect(lastLimit()).toBeUndefined();
        expect(result.current.paginationEnabled).toBe(false);
        unmount();
    });

    it("honours a numeric page size across a re-entry", async () => {
        const collection = makeCollection("small_pages_collection", { pagination: 25 });
        const { render } = mountController(collection);

        const first = render();
        await waitFor(() => expect(listened.length).toBe(1));
        expect(lastLimit()).toBe(25);
        first.unmount();

        const second = render();
        await waitFor(() => expect(listened.length).toBe(2));
        expect(lastLimit()).toBe(25);
        second.unmount();
    });

    it("does not leak a restored count into a different collection", async () => {
        const scrolled = makeCollection("leak_source_collection");
        nextEntities = entities(90, scrolled.path);
        const source = mountController(scrolled);

        const first = source.render();
        await waitFor(() => expect(first.result.current.data).toHaveLength(90));
        act(() => first.result.current.onScroll({ scrollOffset: 400 }));
        first.unmount();

        // A different path is a different cache key, so this one starts from its page size.
        nextEntities = [];
        const other = makeCollection("leak_target_collection");
        const target = mountController(other);
        const second = target.render();
        await waitFor(() => expect(listened.length).toBe(2));

        expect(lastLimit()).toBe(DEFAULT_PAGE_SIZE);
        second.unmount();
    });

});
