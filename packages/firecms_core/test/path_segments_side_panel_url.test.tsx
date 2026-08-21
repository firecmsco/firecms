/**
 * @jest-environment jsdom
 */
import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EntityCollection } from "../src/types";
import { useBuildNavigationController } from "../src/hooks/useBuildNavigationController";
import { useBuildSideEntityController } from "../src/internal/useBuildSideEntityController";
import { buildSidePanelsFromUrl } from "../src/internal/useBuildSideEntityController";
import { encodeEntityId } from "../src/util/navigation_utils";
import { getNavigationEntriesFromPath } from "../src/util/navigation_from_path";

/**
 * The side panel writes the browser URL. That URL is the ESCAPED representation — it is
 * what `buildSidePanelsFromUrl` and `FireCMSRoute` parse back on reload, on a deep link, and
 * on every `location.pathname` change.
 *
 * `props.path` is the RAW datasource path, where a parent entity id keeps its slashes.
 * Building the URL out of it produces a chain that reads back as something else entirely,
 * which is why `fullIdPath` exists and is threaded alongside.
 */

const collections: EntityCollection[] = [
    {
        id: "test",
        name: "Test",
        path: "test",
        properties: {},
        subcollections: [
            { id: "accommodation", name: "Accommodation", path: "accommodation", properties: {} }
        ]
    }
];

const PARENT_ID = "test/test";
/** Raw, as the datasource is addressed. */
const RAW_PATH = "test/test/test/accommodation";
/** Escaped, as the URL must carry it. */
const ID_PATH = `test/${encodeEntityId(PARENT_ID)}/accommodation`;
const SEGMENTS = ["test", PARENT_ID, "accommodation"];

const Router = ({ children }: { children?: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

let navigationController: any;

beforeAll(async () => {
    const { result } = renderHook(() => useBuildNavigationController({
        collections,
        authController: { user: null, initialLoading: false } as any,
        dataSourceDelegate: { key: "test", initialised: true } as any
    }), { wrapper: Router });
    await waitFor(() => expect(result.current.initialised).toBe(true));
    navigationController = result.current;
});

function buildController() {
    const opened: any[] = [];
    const sideDialogsController = {
        open: (p: any) => opened.push(p),
        replace: (p: any) => opened.push(p),
        close: () => undefined,
        sidePanels: [],
        setSidePanels: () => undefined,
        pendingClose: false,
        setPendingClose: () => undefined
    } as any;

    const { result } = renderHook(
        () => useBuildSideEntityController(navigationController, sideDialogsController, { user: null } as any),
        { wrapper: Router });
    return { opened, controller: result.current };
}

describe("the side panel URL", () => {

    it("escapes a slash-bearing parent id instead of writing it raw", () => {
        const { opened, controller } = buildController();

        act(() => controller.open({
            path: RAW_PATH,
            pathSegments: SEGMENTS,
            fullIdPath: ID_PATH,
            entityId: "room-1",
            updateUrl: true
        }));

        const urlPath = opened[0].urlPath as string;

        // The raw parent id must not appear unescaped in the URL: read back, "test/test/test"
        // is three collection/entity hops rather than one id inside one collection.
        expect(urlPath).toContain(encodeURIComponent(encodeEntityId(PARENT_ID)));
        expect(urlPath).toContain("room-1");
    });

    it("produces a URL that parses back to the same chain", () => {
        const { opened, controller } = buildController();

        act(() => controller.open({
            path: RAW_PATH,
            pathSegments: SEGMENTS,
            fullIdPath: ID_PATH,
            entityId: "room-1",
            updateUrl: true
        }));

        const urlPath = opened[0].urlPath as string;
        const dataPath = navigationController.urlPathToDataPath(urlPath.startsWith("/") ? urlPath : "/" + urlPath);
        const panels = buildSidePanelsFromUrl(dataPath, collections, false);

        // Round trip: the panel the URL describes must be the panel we opened.
        expect(panels[panels.length - 1].entityId).toEqual("room-1");
        expect(panels[panels.length - 1].pathSegments).toEqual(SEGMENTS);
        expect(panels[panels.length - 1].path).toEqual(RAW_PATH);
    });

    it("gives two different chains two different panel keys", () => {
        // `test` / id `test/test` / `accommodation` and `test` / id `test` / `test` /
        // id `accommodation`... flatten to the same string. The key must not collide.
        const { opened, controller } = buildController();

        act(() => controller.open({
            path: "test", pathSegments: ["test"], fullIdPath: "test",
            entityId: "test/test/accommodation", updateUrl: true
        }));
        act(() => controller.open({
            path: "test/test/test", pathSegments: ["test", "test/test"], fullIdPath: "test/test%2Ftest",
            entityId: "accommodation", updateUrl: true
        }));

        expect(opened[0].key).not.toEqual(opened[1].key);
    });

});

/**
 * `fullIdPath` is the id-based chain used to build URLs. The recursion appended the entity
 * id to the raw chain and to the URL chain, but not to this one — so a nested collection's
 * `fullIdPath` was "products/locales" instead of "products/pid/locales", and any URL built
 * from it addressed a collection that does not exist.
 */
describe("fullIdPath includes every entity id hop", () => {

    it("keeps the parent entity id in a nested chain", () => {
        const entries = getNavigationEntriesFromPath({ path: "test/eA/accommodation/eB", collections });
        const nested = entries.filter(e => e.type === "collection");

        expect(nested[0].fullIdPath).toEqual("test");
        // Was "test/accommodation": the "eA" hop had been dropped.
        expect(nested[1].fullIdPath).toEqual("test/eA/accommodation");
    });

    it("escapes a slash-bearing parent id in that chain", () => {
        const entries = getNavigationEntriesFromPath({
            path: `test/${encodeEntityId(PARENT_ID)}/accommodation/eB`,
            collections
        });
        const nested = entries.filter(e => e.type === "collection");

        expect(nested[1].fullIdPath).toEqual(`test/${encodeEntityId(PARENT_ID)}/accommodation`);
        // The raw chain keeps the id raw; only the URL-facing one escapes it.
        expect(nested[1].path).toEqual(RAW_PATH);
    });

    it("round-trips a nested panel through the URL it writes", () => {
        const { opened, controller } = buildController();
        const panels = buildSidePanelsFromUrl(
            `/test/${encodeEntityId(PARENT_ID)}/accommodation/room-1`, collections, false);

        expect(panels).toHaveLength(1);
        act(() => controller.open({ ...panels[0], updateUrl: true }));

        const urlPath = opened[0].urlPath as string;
        const back = buildSidePanelsFromUrl(
            navigationController.urlPathToDataPath(urlPath.startsWith("/") ? urlPath : "/" + urlPath),
            collections, false);

        expect(back[0].entityId).toEqual("room-1");
        expect(back[0].path).toEqual(RAW_PATH);
        expect(back[0].pathSegments).toEqual(SEGMENTS);
    });

});
