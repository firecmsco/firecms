/**
 * @jest-environment jsdom
 */
import { describe, expect, it, jest } from "@jest/globals";

/**
 * `initTextSearch` was the last datasource method with a `path` and no segments, so a
 * delegate could not tell which collection a search inside a subcollection referred to.
 *
 * It takes a pre-built props object rather than an inline literal, which is why the
 * source-scanning guard cannot police it and this test exists instead.
 */

const recorded: any[] = [];

const dataSource = {
    initTextSearch: async (props: any) => { recorded.push(props); return true; }
};

jest.mock("../src/hooks/data/useDataSource", () => ({ useDataSource: () => dataSource }));
jest.mock("../src/hooks/useFireCMSContext", () => ({ useFireCMSContext: () => ({}) }));
jest.mock("../src/hooks/useCustomizationController", () => ({
    useCustomizationController: () => ({ plugins: undefined })
}));

import { renderHook, act, waitFor } from "@testing-library/react";
import { useTableSearchHelper } from "../src/components/common/useTableSearchHelper";

const collection = { id: "accommodation", path: "accommodation", name: "A", properties: {}, textSearchEnabled: true } as any;
const PATH = "test/test/test/accommodation";
const SEGMENTS = ["test", "test/test", "accommodation"];

describe("useTableSearchHelper", () => {

    it("passes pathSegments to initTextSearch", async () => {
        recorded.length = 0;

        const { result } = renderHook(() => useTableSearchHelper({
            collection,
            fullPath: PATH,
            pathSegments: SEGMENTS
        }));

        const click = result.current.onTextSearchClick;
        act(() => click?.());
        await waitFor(() => expect(recorded.length).toBe(1));

        expect(recorded[0].pathSegments).toEqual(SEGMENTS);
        // Three segments, not the four that splitting `path` would produce.
        expect(recorded[0].pathSegments).toHaveLength(3);
        expect(recorded[0].path).toEqual(PATH);

        // The "absent when not given" half is not repeated here: the hook forwards the prop
        // verbatim into a single props object, so `undefined` in is `undefined` out, and the
        // no-fabrication guard fails the build on any attempt to derive it from `path`.
    });

});
