/**
 * @jest-environment jsdom
 *
 * The ids a collection view offers under "find by id" are the ones opened in it
 * lately, kept per full path. They used to be kept per collection id, which a
 * subcollection shares under every parent: the products/p2 locales offered the
 * ids opened under products/p1, which do not exist under p2 and opened as an
 * entity that "does not exist in the database".
 */
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { EntityCollection } from "../src/types";
import { addRecentId, getRecentIds } from "../src/components/EntityCollectionView/utils";
import { editEntityAction } from "../src/components/common/default_entity_actions";

// Radix places the popover with a ResizeObserver, which jsdom does not have.
(global as any).ResizeObserver ??= class {
    observe() {
    }

    unobserve() {
    }

    disconnect() {
    }
};

const sideEntityController = { open: jest.fn(), close: jest.fn(), replace: jest.fn() };
const navigation = {
    navigate: jest.fn(),
    buildUrlCollectionPath: (path: string) => `/c/${path}`
};

jest.mock("../src/hooks/useNavigationController", () => ({
    useNavigationController: () => navigation
}));
jest.mock("../src/hooks/useSideEntityController", () => ({
    useSideEntityController: () => sideEntityController
}));
jest.mock("../src/hooks/useTranslation", () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));
// A recent id is previewed by loading it; here it only needs to say which one it is.
jest.mock("../src/preview", () => ({
    ReferencePreview: ({ reference, onClick }: any) =>
        <button onClick={onClick}>{`recent ${reference.id} in ${reference.path}`}</button>
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { EntityIdHeaderWidget } = require("../src/components/EntityCollectionView/EntityIdHeaderWidget");

const locales: EntityCollection = { id: "locales", path: "locales", name: "Locales", properties: {} };
const products: EntityCollection = { id: "products", path: "products", name: "Products", properties: {}, subcollections: [locales] };

const stored = (key: string) => JSON.parse(window.localStorage.getItem("recent_id_searches::" + key) ?? "null");

beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
});

afterEach(() => {
    cleanup();
});

describe("recent ids storage", () => {

    it("keeps each path's ids apart", () => {
        addRecentId("products/p1/locales", "es");
        addRecentId("products/p2/locales", "fr");
        expect(getRecentIds("products/p1/locales")).toEqual(["es"]);
        expect(getRecentIds("products/p2/locales")).toEqual(["fr"]);
        expect(getRecentIds("locales")).toEqual([]);
    });

    it("puts the latest first and does not repeat an id", () => {
        addRecentId("products", "a");
        addRecentId("products", "b");
        expect(addRecentId("products", "a")).toEqual(["a", "b"]);
        expect(getRecentIds("products")).toEqual(["a", "b"]);
    });

    it("keeps the last five", () => {
        for (const id of ["1", "2", "3", "4", "5", "6"])
            addRecentId("products", id);
        expect(getRecentIds("products")).toEqual(["6", "5", "4", "3", "2"]);
    });
});

describe("the Edit row action", () => {

    const entity = (id: string, path: string) => ({ id, path, values: {} });

    async function edit(props: { collection: EntityCollection, entityId: string, entityPath: string, fullPath?: string, fullIdPath?: string }) {
        await editEntityAction.onClick({
            entity: entity(props.entityId, props.entityPath),
            collection: props.collection,
            fullPath: props.fullPath,
            fullIdPath: props.fullIdPath,
            context: { sideEntityController, navigation, analyticsController: undefined } as any,
            openEntityMode: "side_panel",
            view: "collection"
        } as any);
    }

    it("remembers an entity of a subcollection under the subcollection's full path", async () => {
        await edit({ collection: locales, entityId: "es", entityPath: "products/p1/locales", fullPath: "products/p1/locales", fullIdPath: "products/p1/locales" });
        expect(stored("products/p1/locales")).toEqual(["es"]);
        expect(stored("locales")).toBeNull();
    });

    it("does not offer it under another parent", async () => {
        await edit({ collection: locales, entityId: "es", entityPath: "products/p1/locales", fullPath: "products/p1/locales", fullIdPath: "products/p1/locales" });
        expect(getRecentIds("products/p2/locales")).toEqual([]);
    });

    it("keeps a top level collection's ids where they were, under its id", async () => {
        // the collection route passes the collection's id as its fullIdPath
        await edit({ collection: products, entityId: "p1", entityPath: "products", fullPath: "products", fullIdPath: "products" });
        expect(stored("products")).toEqual(["p1"]);
    });

    it("falls back to the full path, then to the collection id", async () => {
        await edit({ collection: locales, entityId: "es", entityPath: "products/p1/locales", fullPath: "products/p1/locales" });
        expect(stored("products/p1/locales")).toEqual(["es"]);
        await edit({ collection: products, entityId: "p9", entityPath: "products" });
        expect(stored("products")).toEqual(["p9"]);
    });

    it("still opens the entity", async () => {
        await edit({ collection: locales, entityId: "es", entityPath: "products/p1/locales", fullPath: "products/p1/locales", fullIdPath: "products/p1/locales" });
        expect(sideEntityController.open).toHaveBeenCalledWith(expect.objectContaining({
            entityId: "es",
            path: "products/p1/locales"
        }));
    });
});

describe("find by id", () => {

    function renderWidget(path: string, collection: EntityCollection = locales) {
        return render(<EntityIdHeaderWidget collection={collection} path={path} fullIdPath={path}/>);
    }

    async function openPopover() {
        await act(async () => {
            fireEvent.click(screen.getByRole("button"));
        });
    }

    const input = () => screen.getByPlaceholderText("find_entity_by_id") as HTMLInputElement;

    async function search(value: string) {
        await act(async () => {
            fireEvent.change(input(), { target: { value } });
        });
        await act(async () => {
            fireEvent.submit(input().form!);
        });
    }

    const recentTexts = () => screen.queryAllByText(/^recent /).map(e => e.textContent);

    it("offers only the ids opened under the same parent", async () => {
        addRecentId("products/p1/locales", "es");
        addRecentId("products/p2/locales", "fr");
        addRecentId("products/p2/locales", "de");
        renderWidget("products/p2/locales");
        await openPopover();
        expect(recentTexts()).toEqual(["recent de in products/p2/locales", "recent fr in products/p2/locales"]);
    });

    it("no longer reads the ids every parent used to share", async () => {
        window.localStorage.setItem("recent_id_searches::locales", JSON.stringify(["es"]));
        renderWidget("products/p2/locales");
        await openPopover();
        expect(recentTexts()).toEqual([]);
    });

    it("lists ids opened since it was mounted", async () => {
        renderWidget("products/p1/locales");
        // a row opened after the header was rendered
        addRecentId("products/p1/locales", "en");
        await openPopover();
        expect(recentTexts()).toEqual(["recent en in products/p1/locales"]);
    });

    it("opens a searched id under its own path and remembers it there", async () => {
        renderWidget("products/p2/locales");
        await openPopover();
        await search("fr");
        expect(sideEntityController.open).toHaveBeenCalledWith(expect.objectContaining({
            entityId: "fr",
            path: "products/p2/locales",
            fullIdPath: "products/p2/locales"
        }));
        expect(stored("products/p2/locales")).toEqual(["fr"]);
        expect(stored("products/p1/locales")).toBeNull();
    });

    it("trims the id it searches", async () => {
        renderWidget("products/p2/locales");
        await openPopover();
        await search("  fr ");
        expect(sideEntityController.open).toHaveBeenCalledWith(expect.objectContaining({ entityId: "fr" }));
        expect(stored("products/p2/locales")).toEqual(["fr"]);
    });

    it("does nothing for an id of only spaces, instead of opening a new entity", async () => {
        renderWidget("products/p2/locales");
        await openPopover();
        await search("   ");
        expect(sideEntityController.open).not.toHaveBeenCalled();
        expect(navigation.navigate).not.toHaveBeenCalled();
        expect(stored("products/p2/locales")).toBeNull();
    });

    it("opens a recent id under its own path", async () => {
        addRecentId("products/p2/locales", "de");
        renderWidget("products/p2/locales");
        await openPopover();
        await act(async () => {
            fireEvent.click(screen.getByText("recent de in products/p2/locales"));
        });
        expect(sideEntityController.open).toHaveBeenCalledWith(expect.objectContaining({
            entityId: "de",
            path: "products/p2/locales"
        }));
    });

    it("opens a searched id full screen in a collection that opens entities so", async () => {
        renderWidget("products/p2/locales", { ...locales, openEntityMode: "full_screen" });
        await openPopover();
        await search("fr");
        expect(navigation.navigate).toHaveBeenCalledWith("/c/products/p2/locales/fr");
        expect(sideEntityController.open).not.toHaveBeenCalled();
    });
});
