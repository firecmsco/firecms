/**
 * @jest-environment jsdom
 *
 * `useReferenceDialog().close()` closes the reference dialog it opened, even
 * when another panel is open on top of it, as an entity added from the dialog
 * is. It used to close whichever panel was on top.
 */
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EntityCollection, SideDialogsController } from "../src/types";

// The dialog's real content is a whole collection table; a stub says which dialog it is.
jest.mock("../src/components", () => ({
    ErrorBoundary: ({ children }: any) => <>{children}</>,
    ReferenceSelectionTable: ({ path }: { path: string }) => <div>{`select from ${path}`}</div>
}));
jest.mock("../src/hooks/useNavigationController", () => ({
    useNavigationController: () => ({ getCollection: () => undefined })
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const { SideDialogs } = require("../src/core/SideDialogs");
const { useBuildSideDialogsController } = require("../src/internal/useBuildSideDialogsController");
const { SideDialogsControllerContext } = require("../src/contexts/SideDialogsControllerContext");
const { useReferenceDialog } = require("../src/hooks/useReferenceDialog");
/* eslint-enable @typescript-eslint/no-require-imports */

const categories: EntityCollection = { id: "categories", path: "categories", name: "Categories", properties: {} };

let controller: SideDialogsController;
let referenceDialog: { open: () => void, close: () => void };

function Harness() {
    controller = useBuildSideDialogsController();
    return <SideDialogsControllerContext.Provider value={controller}>
        <ReferenceField/>
        <SideDialogs/>
    </SideDialogsControllerContext.Provider>;
}

/** A reference field, as the form renders one. */
function ReferenceField() {
    referenceDialog = useReferenceDialog({ path: "categories", collection: categories, multiselect: false });
    return null;
}

const settle = async () => {
    await act(async () => {
        await new Promise(r => setTimeout(r, 20));
    });
};

const openKeys = () => controller.sidePanels.map(p => p.key);

async function run(action: () => void) {
    await act(async () => {
        action();
    });
    await settle();
}

async function openProductWithReferenceDialog() {
    render(<MemoryRouter initialEntries={["/c/products"]}><Harness/></MemoryRouter>);
    await settle();
    await run(() => controller.open({
        key: "products/p1",
        component: <div>product</div>,
        urlPath: "/c/products/p1#side",
        parentUrlPath: "/c/products"
    }));
    await run(() => referenceDialog.open());
    expect(openKeys()).toEqual(["products/p1", "reference_categories"]);
    expect(screen.getByText("select from categories")).toBeTruthy();
}

describe("useReferenceDialog().close()", () => {

    it("closes the dialog when it is on top", async () => {
        await openProductWithReferenceDialog();
        await run(() => referenceDialog.close());
        expect(openKeys()).toEqual(["products/p1"]);
    });

    it("closes the dialog, not the entity open on top of it", async () => {
        await openProductWithReferenceDialog();
        await run(() => controller.open({
            key: "categories/",
            component: <div>new category</div>,
            urlPath: "/c/categories#new_side",
            parentUrlPath: "/c/categories"
        }));
        await run(() => referenceDialog.close());
        expect(openKeys()).toEqual(["products/p1", "categories/"]);
    });
});
