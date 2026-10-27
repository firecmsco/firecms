/**
 * @jest-environment jsdom
 *
 * A collection's path and entity count where the app bar's breadcrumbs that carry
 * them cannot be seen: a side panel covers them, and on small screens a row of
 * them does not fit. Both fold them on two lines: what is above, then the name
 * and the count.
 */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { render, screen } from "@testing-library/react";
import { EntityCollection } from "../src/types";
import { encodeEntityId } from "../src/util/navigation_utils";

let collections: EntityCollection[] = [];

jest.mock("../src/hooks/useNavigationController", () => ({
    useNavigationController: () => ({ collections })
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const { CollectionCountBadge } = require("../src/components/EntityCollectionView/CollectionCountBadge");
const { CollectionPathTitle, PathTitle } = require("../src/components/EntityCollectionView/CollectionPathTitle");
/* eslint-enable @typescript-eslint/no-require-imports */

const notes: EntityCollection = { id: "notes", path: "notes", name: "Notes", properties: {} };
const locales: EntityCollection = { id: "locales", path: "locales", name: "Locales", properties: {}, subcollections: [notes] };
const products: EntityCollection = { id: "products", path: "products", name: "Products", properties: {}, subcollections: [locales] };
// a collection whose id is not its path, nor its subcollection's
const variants: EntityCollection = { id: "variants", path: "item_variants", name: "Variants", properties: {} };
const items: EntityCollection = { id: "items", path: "store_items", name: "Store items", properties: {}, subcollections: [variants] };

beforeEach(() => {
    collections = [products, items];
});

/** The caption above the name: the collections and entities the collection is under. */
function caption(container: HTMLElement): string | null {
    const title = container.firstElementChild as HTMLElement;
    return title.children.length > 1 ? title.firstElementChild!.textContent : null;
}

/** What follows the name: its count, if any. */
const afterName = (name: string) => screen.getByText(name).nextElementSibling as HTMLElement | null;

describe("CollectionCountBadge", () => {

    it("shows the count", () => {
        render(<CollectionCountBadge count={12}/>);
        expect(screen.getByText("12")).toBeTruthy();
    });

    it("shows a count of zero", () => {
        render(<CollectionCountBadge count={0}/>);
        expect(screen.getByText("0")).toBeTruthy();
    });

    it("shows a placeholder while the count loads", () => {
        const { container } = render(<CollectionCountBadge count={null}/>);
        const placeholder = container.firstElementChild as HTMLElement;
        expect(placeholder).toBeTruthy();
        expect(placeholder.textContent).toBe("");
        expect(placeholder.className).toContain("w-8");
    });

    it("shows nothing when there is no count", () => {
        const { container } = render(<CollectionCountBadge count={undefined}/>);
        expect(container.innerHTML).toBe("");
    });
});

describe("PathTitle", () => {

    it("shows what is above as a caption, then the name and the count", () => {
        const { container } = render(<PathTitle parents={["Products", "p1"]} name={"Locales"} count={3}/>);
        expect(caption(container)).toBe("Products / p1");
        expect(afterName("Locales")?.textContent).toBe("3");
    });

    it("shows no caption when nothing is above", () => {
        const { container } = render(<PathTitle parents={[]} name={"Products"} count={2}/>);
        expect(caption(container)).toBeNull();
        expect(afterName("Products")?.textContent).toBe("2");
    });

    it("shows no count when there is none", () => {
        render(<PathTitle parents={["Products"]} name={"p1"} count={undefined}/>);
        expect(afterName("p1")).toBeNull();
    });

    it("keeps the caption and the name on one line each", () => {
        const { container } = render(<PathTitle parents={["Products", "p1"]} name={"Locales"} count={3}/>);
        expect((container.firstElementChild!.firstElementChild as HTMLElement).className).toContain("truncate");
        expect(screen.getByText("Locales").className).toContain("truncate");
    });

    it("takes the classes it is given", () => {
        const { container } = render(<PathTitle parents={[]} name={"Products"} count={2} className={"lg:hidden"}/>);
        expect((container.firstElementChild as HTMLElement).className).toContain("lg:hidden");
    });
});

describe("CollectionPathTitle", () => {

    it("shows a top level collection's name and count, under nothing", () => {
        const { container } = render(<CollectionPathTitle path={"products"} name={"Products"} count={2}/>);
        expect(caption(container)).toBeNull();
        expect(afterName("Products")?.textContent).toBe("2");
    });

    it("shows a subcollection under its parent collection and entity", () => {
        const { container } = render(<CollectionPathTitle path={"products/p1/locales"} name={"Locales"} count={3}/>);
        expect(caption(container)).toBe("Products / p1");
        expect(afterName("Locales")?.textContent).toBe("3");
    });

    it("shows every level above a nested subcollection", () => {
        const { container } = render(<CollectionPathTitle path={"products/p1/locales/en/notes"} name={"Notes"} count={1}/>);
        expect(caption(container)).toBe("Products / p1 / Locales / en");
    });

    it("names collections whose ids are not their paths", () => {
        const { container } = render(<CollectionPathTitle path={"items/i7/variants"} name={"Variants"} count={1}/>);
        expect(caption(container)).toBe("Store items / i7");
    });

    it("resolves a path made of collection paths too", () => {
        const { container } = render(<CollectionPathTitle path={"store_items/i7/item_variants"} name={"Variants"} count={1}/>);
        expect(caption(container)).toBe("Store items / i7");
    });

    it("shows a parent id with a \"/\" as it is, not escaped", () => {
        const { container } = render(<CollectionPathTitle path={`products/${encodeEntityId("a/b")}/locales`} name={"Locales"} count={1}/>);
        expect(caption(container)).toBe("Products / a/b");
    });

    it("shows just the name for a path it cannot resolve", () => {
        const { container } = render(<CollectionPathTitle path={"unknown/x/things"} name={"Things"} count={4}/>);
        expect(caption(container)).toBeNull();
        expect(afterName("Things")?.textContent).toBe("4");
    });

    it("shows a placeholder while the count loads", () => {
        render(<CollectionPathTitle path={"products"} name={"Products"} count={null}/>);
        const placeholder = afterName("Products");
        expect(placeholder).toBeTruthy();
        expect(placeholder!.textContent).toBe("");
    });

    it("shows no count when the datasource cannot count", () => {
        render(<CollectionPathTitle path={"products"} name={"Products"} count={undefined}/>);
        expect(afterName("Products")).toBeNull();
    });

    /** On a phone the panel's tabs squeezed it to "Produ…" over "L…" before it kept its width. */
    it("keeps its width next to the tabs of a side panel, up to a cap", () => {
        const { container } = render(<CollectionPathTitle path={"products/p1/locales"} name={"Locales"} count={3}/>);
        const title = container.firstElementChild as HTMLElement;
        expect(title.className).toContain("shrink-0");
        expect(title.className).toMatch(/max-w-\[\d+px]/);
    });
});
