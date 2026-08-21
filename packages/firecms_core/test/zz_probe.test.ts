import { describe, expect, it } from "@jest/globals";
import { buildSidePanelsFromUrl } from "../src/internal/useBuildSideEntityController";
import { getNavigationEntriesFromPath } from "../src/util/navigation_from_path";
import { EntityCollection } from "../src/types";

const cols: EntityCollection[] = [{
    id: "products", name: "P", path: "products", properties: {},
    subcollections: [{ id: "locales", name: "L", path: "locales", properties: {} }]
}];

describe("probe", () => {
    it("nested panel fullIdPath", () => {
        const panels = buildSidePanelsFromUrl("/products/pid/locales/lid", cols, false);
        console.log("PANELS:", JSON.stringify(panels.map(p => ({ path: p.path, fullIdPath: p.fullIdPath, entityId: p.entityId, segs: p.pathSegments })), null, 1));
        const entries = getNavigationEntriesFromPath({ path: "products/pid/locales/lid", collections: cols });
        console.log("ENTRIES:", JSON.stringify(entries.map((e: any) => ({ type: e.type, path: e.path, fullPath: e.fullPath, fullIdPath: e.fullIdPath, entityId: e.entityId })), null, 1));
        expect(true).toBe(true);
    });
});
