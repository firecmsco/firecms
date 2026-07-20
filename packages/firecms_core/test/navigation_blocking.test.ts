import { shouldBlockEntityNavigation } from "../src/util/navigation_blocking";

const entityPath = "/products/p1";
const basePath = "/products";

function run(over: {
    current?: { pathname: string; hash: string };
    next: { pathname: string; hash: string };
    blocked?: boolean;
}) {
    return shouldBlockEntityNavigation({
        currentLocation: over.current ?? { pathname: entityPath, hash: "" },
        nextLocation: over.next,
        entityPath,
        basePath,
        blocked: over.blocked ?? true
    });
}

describe("shouldBlockEntityNavigation", () => {
    it("never blocks navigation deeper within the same entity", () => {
        expect(run({ next: { pathname: `${entityPath}/sub`, hash: "" }, blocked: true }))
            .toBe(false);
    });

    it("does not block opening a side panel (#side)", () => {
        expect(run({ next: { pathname: "/products/p2", hash: "#side" }, blocked: true }))
            .toBe(false);
    });

    it("does not block opening a new-entity side panel (#new_side)", () => {
        expect(run({ next: { pathname: "/products", hash: "#new_side" }, blocked: true }))
            .toBe(false);
    });

    it("does not block closing a side panel back to the form base path", () => {
        expect(run({
            current: { pathname: "/products/p2", hash: "#side" },
            next: { pathname: basePath, hash: "" },
            blocked: true
        })).toBe(false);
    });

    it("still blocks a real navigation away when the form is dirty", () => {
        expect(run({ next: { pathname: "/orders", hash: "" }, blocked: true }))
            .toBe(true);
    });

    it("does not block a real navigation away when the form is clean", () => {
        expect(run({ next: { pathname: "/orders", hash: "" }, blocked: false }))
            .toBe(false);
    });

    it("does not treat closing to an unrelated path as a side-panel close", () => {
        // currentHash is a side panel but nextLocation is not the base path:
        // falls through to the dirty check and blocks.
        expect(run({
            current: { pathname: "/products/p2", hash: "#side" },
            next: { pathname: "/orders", hash: "" },
            blocked: true
        })).toBe(true);
    });
});
