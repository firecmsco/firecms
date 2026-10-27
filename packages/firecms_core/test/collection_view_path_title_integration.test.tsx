/**
 * @jest-environment jsdom
 *
 * Inside a real FireCMS on an in-memory datasource: a subcollection open in a
 * side panel shows its path and count in the panel's top bar, and the collection
 * view keeps the ids opened in it per full path.
 *
 * Reported as "in a subcollection, path & count are missing (which are really
 * good to have in mobile view as well)": the app bar's breadcrumbs carry them,
 * and a side panel covers the app bar.
 */
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FireCMS } from "../src/core/FireCMS";
import { FireCMSi18nProvider } from "../src/i18n/FireCMSi18nProvider";
import { useBuildNavigationController } from "../src/hooks/useBuildNavigationController";
import { EntityCollectionView } from "../src/components/EntityCollectionView/EntityCollectionView";
import { EntityEditView } from "../src/core/EntityEditView";
import { DataSourceDelegate, EntityCollection } from "../src/types";

// jsdom has none; the table and the popovers measure themselves with it.
(global as any).ResizeObserver ??= class {
    observe() {
    }

    unobserve() {
    }

    disconnect() {
    }
};

const locales: EntityCollection = {
    id: "locales",
    path: "locales",
    name: "Locales",
    singularName: "Locale",
    // a click on a row opens it, instead of selecting the cell to edit it in place
    inlineEditing: false,
    properties: { title: { dataType: "string", name: "Title" } }
};
const products: EntityCollection = {
    id: "products",
    path: "products",
    name: "Products",
    singularName: "Product",
    properties: { name: { dataType: "string", name: "Name" } },
    subcollections: [locales]
};
const collections = [products];

const store: Record<string, Record<string, any>> = {
    products: { p1: { name: "Runner" }, p2: { name: "Beanie" } },
    "products/p1/locales": { en: { title: "Runner (EN)" }, es: { title: "Corredor (ES)" } },
    "products/p2/locales": { fr: { title: "Bonnet" }, de: { title: "Mütze" }, it: { title: "Berretto" } }
};
const entitiesIn = (path: string) => Object.entries(store[path] ?? {}).map(([id, values]) => ({ id, path, values }));

function buildDelegate({ canCount = true, countNever = false } = {}): DataSourceDelegate {
    return {
        key: "memory",
        initialised: true,
        fetchCollection: async ({ path }) => entitiesIn(path),
        listenCollection: ({ path, onUpdate }) => {
            const timeout = setTimeout(() => onUpdate(entitiesIn(path)), 0);
            return () => clearTimeout(timeout);
        },
        fetchEntity: async ({ path, entityId }) => ({ id: entityId, path, values: store[path]?.[entityId] }),
        saveEntity: async ({ path, entityId, values }) => ({ id: entityId!, path, values }),
        deleteEntity: async () => undefined,
        checkUniqueField: async () => true,
        generateEntityId: () => "new",
        countEntities: canCount
            ? (countNever ? () => new Promise<number>(() => undefined) : async ({ path }) => Object.keys(store[path] ?? {}).length)
            : undefined,
        delegateToCMSModel: (data) => data,
        cmsToDelegateModel: (data) => data,
        currentTime: () => new Date()
    } as DataSourceDelegate;
}

const authController = {
    user: { uid: "u1", email: "u1@example.com" },
    initialLoading: false,
    authLoading: false,
    getAuthToken: async () => "id-token",
    signOut: async () => undefined,
    loginSkipped: false,
    extra: null,
    setExtra: () => undefined
} as any;

function App({ delegate, children }: { delegate: DataSourceDelegate, children: React.ReactNode }) {
    const navigationController = useBuildNavigationController({
        collections,
        authController,
        dataSourceDelegate: delegate
    });
    return <FireCMS navigationController={navigationController}
                   authController={authController}
                   dataSourceDelegate={delegate}
                   storageSource={{} as any}>
        {({ loading }) => loading ? <div data-testid="loading"/> : <>{children}</>}
    </FireCMS>;
}

/** Sets the screen size `useLargeLayout` reads, which it re-reads on resize. */
function setLargeScreen(large: boolean) {
    window.matchMedia = ((query: string) => ({
        matches: large,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false
    })) as any;
    window.dispatchEvent(new Event("resize"));
}

/** A product open in an entity view, with the panel's close button in its top bar. */
function ProductView({ productId, layout, selectedTab }: {
    productId: string,
    layout: "side_panel" | "full_screen",
    selectedTab?: string
}) {
    return <EntityEditView
        path={"products"}
        fullIdPath={"products"}
        collection={products}
        entityId={productId}
        parentCollectionIds={[]}
        layout={layout}
        selectedTab={selectedTab}
        barActions={() => <button data-testid="close-panel">close</button>}/>;
}

/** A product's locales, as the entity view shows them in one of its tabs. */
function LocalesOf({ productId, layout, onCountChange }: {
    productId: string,
    layout: "side_panel" | "full_screen",
    onCountChange?: (count: number) => void
}) {
    const path = `products/${productId}/locales`;
    return <EntityCollectionView
        fullPath={path}
        fullIdPath={path}
        parentCollectionIds={["products"]}
        isSubCollection={true}
        updateUrl={false}
        {...locales}
        openEntityMode={layout}
        onCountChange={onCountChange}/>;
}

const settle = async () => {
    await act(async () => {
        await new Promise(r => setTimeout(r, 20));
    });
};

async function renderInCms(ui: React.ReactNode, delegate = buildDelegate()) {
    render(
        <FireCMSi18nProvider locale="en">
            <MemoryRouter>
                <App delegate={delegate}>{ui}</App>
            </MemoryRouter>
        </FireCMSi18nProvider>
    );
    await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
    await settle();
}

/** The entity view's top bar, where the side panel's close button is. */
const topBar = () => screen.getByTestId("close-panel").parentElement as HTMLElement;

/** The path title in the top bar, found by its caption; the tab next to it has the same name. */
const titleUnder = (caption: string) => within(topBar()).getByText(caption).parentElement as HTMLElement;

/** What follows the name in that title: its count, if any. */
const countNextTo = (name: string, caption: string) =>
    within(titleUnder(caption)).getByText(name).nextElementSibling as HTMLElement | null;

beforeEach(() => {
    window.localStorage.clear();
    (global as any).fetch = jest.fn(async () => ({ json: async () => ({}) }));
    jest.spyOn(console, "debug").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    setLargeScreen(true);
});

afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
});

describe("a subcollection open in a side panel", () => {

    it("shows its parent's path, its name and its count in the panel's top bar", async () => {
        await renderInCms(<ProductView productId={"p1"} layout={"side_panel"} selectedTab={"locales"}/>);
        await waitFor(() => expect(within(topBar()).getByText("Products / p1")).toBeTruthy());
        await waitFor(() => expect(countNextTo("Locales", "Products / p1")?.textContent).toBe("2"));
    });

    it("counts the entities under its own parent", async () => {
        await renderInCms(<ProductView productId={"p2"} layout={"side_panel"} selectedTab={"locales"}/>);
        await waitFor(() => expect(within(topBar()).getByText("Products / p2")).toBeTruthy());
        await waitFor(() => expect(countNextTo("Locales", "Products / p2")?.textContent).toBe("3"));
    });

    it("shows them on small screens too, where the panel covers the whole screen", async () => {
        setLargeScreen(false);
        await renderInCms(<ProductView productId={"p1"} layout={"side_panel"} selectedTab={"locales"}/>);
        await waitFor(() => expect(within(topBar()).getByText("Products / p1")).toBeTruthy());
        await waitFor(() => expect(countNextTo("Locales", "Products / p1")?.textContent).toBe("2"));
    });

    it("shows a placeholder while the count loads", async () => {
        await renderInCms(<ProductView productId={"p1"} layout={"side_panel"} selectedTab={"locales"}/>, buildDelegate({ countNever: true }));
        await waitFor(() => expect(within(topBar()).getByText("Products / p1")).toBeTruthy());
        expect(countNextTo("Locales", "Products / p1")?.textContent).toBe("");
    });

    it("shows no count when the datasource cannot count", async () => {
        await renderInCms(<ProductView productId={"p1"} layout={"side_panel"} selectedTab={"locales"}/>, buildDelegate({ canCount: false }));
        await waitFor(() => expect(within(topBar()).getByText("Products / p1")).toBeTruthy());
        expect(countNextTo("Locales", "Products / p1")).toBeNull();
    });

    it("no longer shows them in the collection's own toolbar", async () => {
        await renderInCms(<ProductView productId={"p1"} layout={"side_panel"} selectedTab={"locales"}/>);
        await waitFor(() => expect(within(topBar()).getByText("Products / p1")).toBeTruthy());
        expect(screen.getAllByText("Products / p1")).toHaveLength(1);
    });
});

describe("the panel's top bar shows nothing of the kind", () => {

    it("on the entity's own tab", async () => {
        await renderInCms(<ProductView productId={"p1"} layout={"side_panel"}/>);
        await screen.findByDisplayValue("Runner");
        expect(within(topBar()).queryByText("Products / p1")).toBeNull();
    });

    it("in a full screen entity view, under the app bar's breadcrumbs", async () => {
        await renderInCms(<ProductView productId={"p1"} layout={"full_screen"} selectedTab={"locales"}/>);
        await screen.findByText("Runner (EN)");
        expect(screen.queryByText("Products / p1")).toBeNull();
    });
});

describe("switching tabs in a side panel", () => {

    const tab = (name: string) => within(topBar()).getAllByText(name).find(e => e.closest("[role=tab]"))!.closest("[role=tab]")!;

    it("shows the title on the subcollection's tab and takes it away on the entity's", async () => {
        await renderInCms(<ProductView productId={"p1"} layout={"side_panel"}/>);
        await screen.findByDisplayValue("Runner");
        expect(within(topBar()).queryByText("Products / p1")).toBeNull();

        await act(async () => {
            fireEvent.mouseDown(tab("Locales"), { button: 0 });
        });
        await waitFor(() => expect(countNextTo("Locales", "Products / p1")?.textContent).toBe("2"));

        await act(async () => {
            fireEvent.mouseDown(tab("Product"), { button: 0 });
        });
        await waitFor(() => expect(within(topBar()).queryByText("Products / p1")).toBeNull());
    });
});

describe("the collection view", () => {

    it("reports its count", async () => {
        const onCountChange = jest.fn();
        await renderInCms(<LocalesOf productId={"p2"} layout={"side_panel"} onCountChange={onCountChange}/>);
        await waitFor(() => expect(onCountChange).toHaveBeenCalledWith(3));
    });

    it("draws neither path nor count in its own toolbar, on any screen", async () => {
        setLargeScreen(false);
        await renderInCms(<LocalesOf productId={"p1"} layout={"side_panel"}/>);
        await screen.findByText("Runner (EN)");
        expect(screen.queryByText("Products / p1")).toBeNull();
        expect(screen.queryByText("Locales")).toBeNull();
    });

    it("remembers an opened entity under the subcollection's full path only", async () => {
        await renderInCms(<LocalesOf productId={"p1"} layout={"side_panel"}/>);
        const row = await screen.findByText("Corredor (ES)");
        await act(async () => {
            fireEvent.click(row);
        });
        expect(JSON.parse(window.localStorage.getItem("recent_id_searches::products/p1/locales") ?? "[]")).toEqual(["es"]);
        expect(window.localStorage.getItem("recent_id_searches::locales")).toBeNull();
        expect(window.localStorage.getItem("recent_id_searches::products/p2/locales")).toBeNull();
    });
});
