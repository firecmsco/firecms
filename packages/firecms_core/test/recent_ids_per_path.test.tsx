/**
 * @jest-environment jsdom
 *
 * The ids a collection view offers under "find by id" are the ones opened in it
 * lately, kept per full path. They used to be kept per collection id, which a
 * subcollection shares under every parent: the products/p2 locales offered the
 * ids opened under products/p1, which do not exist under p2 and opened as an
 * entity that "does not exist in the database".
 *
 * Only ids that exist are listed or remembered: a searched id that did not exist
 * was kept, then fetched and shown as "Entity not found" on every opening.
 */
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { EntityCollection } from "../src/types";
import { addRecentId, getRecentIds, removeRecentIds } from "../src/components/EntityCollectionView/utils";
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
    buildUrlCollectionPath: (path: string) => `/c/${path}`,
    resolveIdsFrom: (path: string) => path
};

/** The entities that exist, by path and id; a fetch of any other finds nothing. */
let store: Record<string, Record<string, object>> = {};
/** Ids whose fetch fails, as one without network or permission would. */
let failingIds: string[] = [];
/** Ids answered as Firestore answers a missing document: an entity without values. */
let valuelessIds: string[] = [];
const fetchEntity = jest.fn(async ({ path, entityId }: { path: string, entityId: string }) => {
    if (failingIds.includes(entityId)) throw new Error("unavailable");
    if (valuelessIds.includes(entityId)) return { id: entityId, path, values: undefined };
    const values = store[path]?.[entityId];
    return values ? { id: entityId, path, values } : undefined;
});

jest.mock("../src/hooks/useNavigationController", () => ({
    useNavigationController: () => navigation
}));
jest.mock("../src/hooks/useSideEntityController", () => ({
    useSideEntityController: () => sideEntityController
}));
jest.mock("../src/hooks/data/useDataSource", () => ({
    useDataSource: () => ({ fetchEntity })
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
    store = {
        "products/p1/locales": { en: { title: "Runner (EN)" }, es: { title: "Corredor (ES)" } },
        "products/p2/locales": { fr: { title: "Bonnet" }, de: { title: "Mütze" } }
    };
    failingIds = [];
    valuelessIds = [];
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

    it("forgets the given ids and keeps the rest in order", () => {
        for (const id of ["a", "b", "c", "d"])
            addRecentId("products", id);
        expect(removeRecentIds("products", ["c", "a", "zzz"])).toEqual(["d", "b"]);
        expect(getRecentIds("products")).toEqual(["d", "b"]);
        expect(getRecentIds("locales")).toEqual([]);
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

    const settle = async () => {
        await act(async () => {
            await new Promise(r => setTimeout(r, 0));
        });
    };

    async function openPopover() {
        await act(async () => {
            fireEvent.click(screen.getByRole("button"));
        });
        // the recent ids are checked before they are listed
        await settle();
    }

    const input = () => screen.getByPlaceholderText("find_entity_by_id") as HTMLInputElement;

    async function search(value: string) {
        await act(async () => {
            fireEvent.change(input(), { target: { value } });
        });
        await act(async () => {
            fireEvent.submit(input().form!);
        });
        // and a searched one before it is remembered
        await settle();
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

    it("does not list a recent id that no longer exists, and forgets it", async () => {
        addRecentId("products/p2/locales", "fr");
        addRecentId("products/p2/locales", "gone");
        renderWidget("products/p2/locales");
        await openPopover();
        expect(recentTexts()).toEqual(["recent fr in products/p2/locales"]);
        expect(stored("products/p2/locales")).toEqual(["fr"]);
    });

    it("treats an entity without values as missing, as Firestore returns one", async () => {
        valuelessIds = ["ghost"];
        addRecentId("products/p2/locales", "ghost");
        renderWidget("products/p2/locales");
        await openPopover();
        expect(recentTexts()).toEqual([]);
        expect(stored("products/p2/locales")).toEqual([]);
    });

    it("keeps an id it could not check for next time, without listing it", async () => {
        failingIds = ["fr"];
        addRecentId("products/p2/locales", "fr");
        renderWidget("products/p2/locales");
        await openPopover();
        expect(recentTexts()).toEqual([]);
        expect(stored("products/p2/locales")).toEqual(["fr"]);
    });

    it("checks the ids in the path it lists them for", async () => {
        addRecentId("products/p2/locales", "fr");
        renderWidget("products/p2/locales");
        await openPopover();
        expect(fetchEntity).toHaveBeenCalledWith(expect.objectContaining({ path: "products/p2/locales", entityId: "fr" }));
    });

    it("still opens a searched id that does not exist, but does not remember it", async () => {
        renderWidget("products/p2/locales");
        await openPopover();
        await search("nope");
        expect(sideEntityController.open).toHaveBeenCalledWith(expect.objectContaining({ entityId: "nope" }));
        expect(stored("products/p2/locales")).toBeNull();
    });

    it("does not remember a searched id it could not check", async () => {
        failingIds = ["fr"];
        renderWidget("products/p2/locales");
        await openPopover();
        await search("fr");
        expect(stored("products/p2/locales")).toBeNull();
    });

    it("lists a searched id the next time it opens, once found", async () => {
        renderWidget("products/p2/locales");
        await openPopover();
        await search("de");
        await openPopover();
        expect(recentTexts()).toEqual(["recent de in products/p2/locales"]);
    });

    it("opens a searched id full screen in a collection that opens entities so", async () => {
        renderWidget("products/p2/locales", { ...locales, openEntityMode: "full_screen" });
        await openPopover();
        await search("fr");
        expect(navigation.navigate).toHaveBeenCalledWith("/c/products/p2/locales/fr");
        expect(sideEntityController.open).not.toHaveBeenCalled();
    });
});
