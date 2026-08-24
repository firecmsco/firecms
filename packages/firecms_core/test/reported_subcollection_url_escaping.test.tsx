/**
 * @jest-environment jsdom
 */
import { beforeAll, describe, expect, it } from "@jest/globals";
import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EntityCollection } from "../src/types";
import { useBuildNavigationController } from "../src/hooks/useBuildNavigationController";
import {
    buildSidePanelsFromUrl,
    useBuildSideEntityController
} from "../src/internal/useBuildSideEntityController";
import { encodeEntityId, removeInitialAndTrailingSlashes } from "../src/util/navigation_utils";

/**
 * The bug as reported:
 *
 *   "when there is a slash in an entity id and it is the first level, the url is fine, but
 *    if that entity has subcollections, in the subcollection the url is not escaping the
 *    slashes"
 *
 * That asymmetry is the tell. The side panel built its URL out of `props.path`, the RAW
 * datasource path, escaping only the leaf entity id:
 *
 *   first level:    path "test"                        -> nothing in it to escape, fine
 *   subcollection:  path "test/test/test/accommodation" -> the parent id "test/test" is
 *                                                          already flattened into it, and
 *                                                          the escaping never applied
 *
 * The escaped chain (`fullIdPath`) was threaded alongside the whole time. These tests pin
 * both levels, so the one that used to work cannot regress while fixing the one that did not.
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
const ESCAPED_PARENT = encodeEntityId(PARENT_ID);      // "test%2Ftest"

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

function open(props: any) {
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
    act(() => result.current.open(props));
    return opened[0];
}

/** Everything after the collection base, decoded once as the router would. */
function dataPathOf(panel: any): string {
    const urlPath: string = panel.urlPath;
    return removeInitialAndTrailingSlashes(
        navigationController.urlPathToDataPath(urlPath.startsWith("/") ? urlPath : "/" + urlPath));
}

describe("the reported bug: a slash-bearing id at the first level", () => {

    /**
     * This half always worked, and is here so the fix for the subcollection cannot break it.
     */
    it("escapes the slash in the URL", () => {
        const panel = open({
            path: "test",
            pathSegments: ["test"],
            fullIdPath: "test",
            entityId: PARENT_ID,
            updateUrl: true
        });

        expect(dataPathOf(panel)).toEqual(`test/${ESCAPED_PARENT}`);
    });

    it("round-trips back to the same entity", () => {
        const panel = open({
            path: "test", pathSegments: ["test"], fullIdPath: "test",
            entityId: PARENT_ID, updateUrl: true
        });

        const back = buildSidePanelsFromUrl(dataPathOf(panel), collections, false);
        expect(back[0].entityId).toEqual(PARENT_ID);
        expect(back[0].path).toEqual("test");
    });

});

describe("the reported bug: the subcollection of that entity", () => {

    /**
     * What `EntityEditView` hands to the subcollection's `EntityCollectionView`, and what
     * `onEntityClick` then opens with. The raw path has the parent id flattened into it; the
     * id path has it escaped.
     */
    const RAW_SUBCOLLECTION_PATH = `test/${PARENT_ID}/accommodation`;          // test/test/test/accommodation
    const ESCAPED_SUBCOLLECTION_PATH = `test/${ESCAPED_PARENT}/accommodation`; // test/test%2Ftest/accommodation

    it("escapes the parent id in the URL", () => {
        const panel = open({
            path: RAW_SUBCOLLECTION_PATH,
            pathSegments: ["test", PARENT_ID, "accommodation"],
            fullIdPath: ESCAPED_SUBCOLLECTION_PATH,
            entityId: "room-1",
            updateUrl: true
        });

        const dataPath = dataPathOf(panel);

        expect(dataPath).toEqual(`${ESCAPED_SUBCOLLECTION_PATH}/room-1`);
        // The raw form must not appear: read back it is four hops, not two.
        expect(dataPath).not.toEqual(`${RAW_SUBCOLLECTION_PATH}/room-1`);
    });

    it("round-trips back to the same entity and the same chain", () => {
        const panel = open({
            path: RAW_SUBCOLLECTION_PATH,
            pathSegments: ["test", PARENT_ID, "accommodation"],
            fullIdPath: ESCAPED_SUBCOLLECTION_PATH,
            entityId: "room-1",
            updateUrl: true
        });

        const back = buildSidePanelsFromUrl(dataPathOf(panel), collections, false);

        expect(back).toHaveLength(1);
        expect(back[0].entityId).toEqual("room-1");
        expect(back[0].path).toEqual(RAW_SUBCOLLECTION_PATH);
        expect(back[0].pathSegments).toEqual(["test", PARENT_ID, "accommodation"]);
    });

    it("the unescaped URL would have resolved to a different entity", () => {
        // Why the bug was invisible rather than an error: the wrong URL is still a valid
        // one. It just names something else.
        const wrong = buildSidePanelsFromUrl(`${RAW_SUBCOLLECTION_PATH}/room-1`, collections, false);

        expect(wrong[0].entityId).not.toEqual("room-1");
        expect(wrong[0].entityId).toEqual("test");
    });

});
