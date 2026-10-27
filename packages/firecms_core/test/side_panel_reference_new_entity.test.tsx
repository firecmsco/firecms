/**
 * @jest-environment jsdom
 *
 * Saving an entity created from a reference dialog closes that dialog, not the
 * entity it was opened from.
 *
 * "Add" in a reference dialog opens the new entity in a panel on top of the
 * dialog. Once it is saved, the dialog selects it and asks to close; then
 * `EntitySidePanel.onUpdate` moves the panel to the saved entity and, for
 * "Create and close", closes it. The dialog's close used to pop whichever
 * panel was on top, the new entity, and the entity's own close then popped one
 * more, while going back twice in history for the single entry the entity had
 * pushed: the entity being edited under the dialog was closed too, along with
 * the reference it had just been given.
 *
 * Closing the new entity without saving goes back to the dialog. The dialog has
 * no URL, so it pushes no history entry, and going back to the entry under it
 * used to drop it as well.
 */
import { describe, expect, it } from "@jest/globals";
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { SideDialogController, SideDialogs, useSideDialogContext } from "../src/core/SideDialogs";
import { useBuildSideDialogsController } from "../src/internal/useBuildSideDialogsController";
import { SideDialogsControllerContext } from "../src/contexts/SideDialogsControllerContext";
import { SideDialogsController } from "../src/types";

let controller: SideDialogsController;
let navigate: NavigateFunction;
const panelContexts: Record<string, SideDialogController> = {};

function Panel({ name }: { name: string }) {
    panelContexts[name] = useSideDialogContext();
    return <div>{name}</div>;
}

function Harness() {
    controller = useBuildSideDialogsController();
    navigate = useNavigate();
    const location = useLocation();
    return <SideDialogsControllerContext.Provider value={controller}>
        <div data-testid="here">{location.pathname + location.hash}</div>
        <SideDialogs/>
    </SideDialogsControllerContext.Provider>;
}

const settle = async () => {
    await act(async () => {
        await new Promise(r => setTimeout(r, 20));
    });
};

const here = () => screen.getByTestId("here").textContent;
const openKeys = () => controller.sidePanels.map(p => p.key);

/** A product open in a side panel, its category reference dialog, and a new category added from it. */
async function openNewEntityFromReferenceDialog() {
    render(<MemoryRouter initialEntries={["/c/products"]}><Harness/></MemoryRouter>);
    await act(async () => {
        controller.open({
            key: "products/p1",
            component: <Panel name="product"/>,
            urlPath: "/c/products/p1#side",
            parentUrlPath: "/c/products"
        });
    });
    await settle();
    await act(async () => {
        // as useReferenceDialog opens it: no URL
        controller.open({
            key: "reference_categories",
            component: <Panel name="reference"/>
        });
    });
    await settle();
    await act(async () => {
        controller.open({
            key: "categories/",
            component: <Panel name="category"/>,
            urlPath: "/c/categories#new_side",
            parentUrlPath: "/c/categories"
        });
    });
    await settle();
    expect(openKeys()).toEqual(["products/p1", "reference_categories", "categories/"]);
    expect(here()).toBe("/c/categories#new_side");
}

/**
 * What a successful save of the new category runs, in order: the reference
 * dialog's onUpdate selects it and closes the dialog, then EntitySidePanel
 * moves the panel to the saved entity and, on "Create and close", closes it.
 */
async function saveNewCategory(andClose: boolean) {
    const reference = panelContexts.reference;
    const category = panelContexts.category;
    await act(async () => {
        reference.close(false);
        controller.replace({
            key: "categories/c9",
            component: <Panel name="category"/>,
            urlPath: "/c/categories/c9#side",
            parentUrlPath: "/c/categories"
        });
        if (andClose)
            category.close(true);
    });
    await settle();
}

describe("saving an entity created from a reference dialog", () => {

    it("\"Create and close\" goes back to the entity the reference was picked for", async () => {
        await openNewEntityFromReferenceDialog();
        await saveNewCategory(true);
        expect(openKeys()).toEqual(["products/p1"]);
        expect(here()).toBe("/c/products/p1#side");
        expect(screen.getByText("product")).toBeTruthy();
    });

    it("\"Create\" keeps the saved entity open over that entity", async () => {
        await openNewEntityFromReferenceDialog();
        await saveNewCategory(false);
        expect(openKeys()).toEqual(["products/p1", "categories/c9"]);
        expect(here()).toBe("/c/categories/c9#side");
    });

    it("closing the saved entity afterwards still leaves the product open", async () => {
        await openNewEntityFromReferenceDialog();
        await saveNewCategory(false);
        await act(async () => {
            panelContexts.category.close(true);
        });
        await settle();
        expect(openKeys()).toEqual(["products/p1"]);
        expect(here()).toBe("/c/products/p1#side");
    });

});

describe("closing an entity opened from a reference dialog without saving", () => {

    it("goes back to the reference dialog", async () => {
        await openNewEntityFromReferenceDialog();
        await act(async () => {
            panelContexts.category.close(true);
        });
        await settle();
        expect(openKeys()).toEqual(["products/p1", "reference_categories"]);
        expect(here()).toBe("/c/products/p1#side");
    });

    it("then picking a reference closes only the dialog", async () => {
        await openNewEntityFromReferenceDialog();
        await act(async () => {
            panelContexts.category.close(true);
        });
        await settle();
        await act(async () => {
            panelContexts.reference.close(false);
        });
        await settle();
        expect(openKeys()).toEqual(["products/p1"]);
        expect(here()).toBe("/c/products/p1#side");
    });

    it("going back past the product closes the dialog with it", async () => {
        await openNewEntityFromReferenceDialog();
        await act(async () => {
            panelContexts.category.close(true);
        });
        await settle();
        await act(async () => {
            navigate(-1);
        });
        await settle();
        expect(openKeys()).toEqual([]);
        expect(here()).toBe("/c/products");
    });
});

describe("a reference dialog opened over a page, with no panel under it", () => {

    async function openOverPage() {
        render(<MemoryRouter initialEntries={["/c/products/p1"]}><Harness/></MemoryRouter>);
        await act(async () => {
            controller.open({
                key: "reference_categories",
                component: <Panel name="reference"/>
            });
        });
        await settle();
        await act(async () => {
            controller.open({
                key: "categories/",
                component: <Panel name="category"/>,
                urlPath: "/c/categories#new_side",
                parentUrlPath: "/c/categories"
            });
        });
        await settle();
        expect(openKeys()).toEqual(["reference_categories", "categories/"]);
    }

    it("stays open when the entity added from it is closed", async () => {
        await openOverPage();
        await act(async () => {
            panelContexts.category.close(true);
        });
        await settle();
        expect(openKeys()).toEqual(["reference_categories"]);
        expect(here()).toBe("/c/products/p1");
    });

    it("closes when the app navigates to another page", async () => {
        await openOverPage();
        await act(async () => {
            panelContexts.category.close(true);
        });
        await settle();
        await act(async () => {
            navigate("/c/orders");
        });
        await settle();
        expect(openKeys()).toEqual([]);
    });
});

describe("the side dialogs controller", () => {

    const entityPanel = (key: string, name: string = key) => ({
        key,
        component: <Panel name={name}/>,
        urlPath: `/c/${key}#side`,
        parentUrlPath: `/c/${key.split("/").slice(0, -1).join("/")}`
    });
    const dialog = (key: string, name: string = key) => ({ key, component: <Panel name={name}/> });

    async function start(at = "/c/products") {
        render(<MemoryRouter initialEntries={[at]}><Harness/></MemoryRouter>);
        await settle();
    }

    async function run(action: () => void) {
        await act(async () => {
            action();
        });
        await settle();
    }

    it("after \"Create and close\", closing the product goes back to the collection", async () => {
        await openNewEntityFromReferenceDialog();
        await saveNewCategory(true);
        await run(() => panelContexts.product.close(true));
        expect(openKeys()).toEqual([]);
        expect(here()).toBe("/c/products");
    });

    it("after \"Create\", closing the entity and then the product goes back to the collection", async () => {
        await openNewEntityFromReferenceDialog();
        await saveNewCategory(false);
        await run(() => panelContexts.category.close(true));
        await run(() => panelContexts.product.close(true));
        expect(openKeys()).toEqual([]);
        expect(here()).toBe("/c/products");
    });

    it("going back in the browser from an entity opened from a dialog returns to the dialog", async () => {
        await openNewEntityFromReferenceDialog();
        await run(() => navigate(-1));
        expect(openKeys()).toEqual(["products/p1", "reference_categories"]);
        expect(here()).toBe("/c/products/p1#side");
    });

    it("going forward again opens that entity over the dialog once more", async () => {
        await openNewEntityFromReferenceDialog();
        await run(() => navigate(-1));
        await run(() => navigate(1));
        expect(openKeys()).toEqual(["products/p1", "reference_categories", "categories/"]);
        expect(here()).toBe("/c/categories#new_side");
    });

    it("keeps two dialogs without URLs open when a panel above them closes", async () => {
        await start();
        await run(() => controller.open(entityPanel("products/p1", "product")));
        await run(() => controller.open(dialog("reference_categories", "reference")));
        await run(() => controller.open(dialog("custom_dialog", "custom")));
        await run(() => controller.open(entityPanel("categories/c1", "category")));
        await run(() => panelContexts.category.close(true));
        expect(openKeys()).toEqual(["products/p1", "reference_categories", "custom_dialog"]);
    });

    it("keeps a dialog opened together with the panel under it", async () => {
        await start();
        await run(() => controller.open([entityPanel("products/p1", "product"), dialog("reference_categories", "reference")]));
        await run(() => controller.open(entityPanel("categories/c1", "category")));
        await run(() => panelContexts.category.close(true));
        expect(openKeys()).toEqual(["products/p1", "reference_categories"]);
    });

    it("closes a dialog with no panel under it when the browser goes back to the page before", async () => {
        render(<MemoryRouter initialEntries={["/c/products", "/c/products/p1"]} initialIndex={1}><Harness/></MemoryRouter>);
        await settle();
        await run(() => controller.open(dialog("reference_categories", "reference")));
        await run(() => navigate(-1));
        expect(openKeys()).toEqual([]);
        expect(here()).toBe("/c/products");
    });

    it("closes the top panel for a key it does not know", async () => {
        await start();
        await run(() => controller.open(entityPanel("products/p1", "product")));
        await run(() => controller.open(dialog("reference_categories", "reference")));
        await run(() => controller.close("nothing_open_with_this_key"));
        expect(openKeys()).toEqual(["products/p1"]);
    });

    it("closes the top panel when a panel with a URL under it asks, as before", async () => {
        // its history entry cannot be taken out of the middle of the history
        await start();
        await run(() => controller.open(entityPanel("products/p1", "product")));
        await run(() => controller.open(entityPanel("products/p2", "other")));
        await run(() => controller.close("products/p1"));
        expect(openKeys()).toEqual(["products/p1"]);
        expect(here()).toBe("/c/products/p1#side");
    });

    it("closes the upper of two dialogs that share a key", async () => {
        await start();
        await run(() => controller.open(entityPanel("products/p1", "product")));
        await run(() => controller.open(dialog("reference_categories", "reference")));
        await run(() => controller.open(entityPanel("categories/", "category")));
        await run(() => controller.open(dialog("reference_categories", "second reference")));
        await run(() => panelContexts["second reference"].close(false));
        expect(openKeys()).toEqual(["products/p1", "reference_categories", "categories/"]);
    });

    it("asks before closing a dialog with unsaved changes under another panel, then closes only it", async () => {
        await openNewEntityFromReferenceDialog();
        await run(() => panelContexts.reference.setBlocked(true));
        await run(() => panelContexts.reference.close(false));
        // nothing closes until the unsaved changes dialog is answered
        expect(openKeys()).toEqual(["products/p1", "reference_categories", "categories/"]);
        const confirm = screen.getAllByRole("button").find(b => /ok/i.test(b.textContent ?? ""))!;
        await run(() => fireEvent.click(confirm));
        expect(openKeys()).toEqual(["products/p1", "categories/"]);
        expect(here()).toBe("/c/categories#new_side");
    });
});
