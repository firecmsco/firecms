/**
 * @jest-environment jsdom
 *
 * A save that moves the side panel is not stopped by the panel's own
 * unsaved-changes guard.
 *
 * "Create" on a new entity replaces the panel with the saved entity's address
 * (`/c/orders#new_side` → `/c/orders/7#side`), a pathname change. The save
 * reports the form clean first — `onSaveSuccess` calls `onValuesModified(false)`,
 * which is `setBlocked(false)` — and `EntitySidePanel.onUpdate` then calls
 * `sideEntityController.replace`, both in the same tick, so `blocked` is still
 * `true` in the last render when the navigation happens.
 *
 * FireCMS is safe from this because the panel's guard
 * (`useLeavePageConfirmation`) only listens to `beforeunload`; it never
 * registers a router blocker, so a `navigate()` call passes it. Rebase put the same guard on React Router's
 * `useBlocker`, read `blocked` from the last render, and asked "There are
 * unsaved changes" about an entity that was already saved, leaving the URL on
 * `#new_side`. This test fails if the guard is moved onto the router that way.
 */
import { describe, expect, it } from "@jest/globals";
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { createMemoryRouter, MemoryRouter, RouterProvider, useLocation } from "react-router-dom";
import { SideDialogController, SideDialogs, useSideDialogContext } from "../src/core/SideDialogs";
import { useBuildSideDialogsController } from "../src/internal/useBuildSideDialogsController";
import { SideDialogsControllerContext } from "../src/contexts/SideDialogsControllerContext";
import { SideDialogsController } from "../src/types";

// jsdom has no fetch primitives; the data router builds a Request per navigation.
if (typeof globalThis.Request === "undefined") {
    Object.defineProperty(globalThis, "Request", {
        configurable: true,
        value: class {
            url: string;
            method: string;
            signal: unknown;

            constructor(url: string, init: { method?: string, signal?: unknown } = {}) {
                this.url = String(url);
                this.method = init.method ?? "GET";
                this.signal = init.signal;
            }
        }
    });
}

const UNSAVED_MESSAGE = "You have unsaved changes in this Order.";

let controller: SideDialogsController;
let panelContext: SideDialogController;

/** The entity form inside the panel, reduced to what it tells the panel. */
function PanelForm() {
    panelContext = useSideDialogContext();
    return <div/>;
}

const panel = (key: string, urlPath: string) => ({
    key,
    component: <PanelForm/>,
    urlPath,
    parentUrlPath: "/c/orders"
});

function Harness() {
    controller = useBuildSideDialogsController();
    const location = useLocation();
    return <SideDialogsControllerContext.Provider value={controller}>
        <div data-testid="here">{location.pathname + location.hash}</div>
        <SideDialogs/>
    </SideDialogsControllerContext.Provider>;
}

const routers: [string, () => React.ReactElement][] = [
    // what `FireCMSRouter` builds, the only setup where `useBlocker` works
    ["a data router", () => <RouterProvider router={createMemoryRouter(
        [{ path: "*", element: <Harness/> }],
        { initialEntries: ["/c/orders"] }
    )}/>],
    // what the CLI templates and FireCMS Cloud mount (`<BrowserRouter>`)
    ["a component router", () => <MemoryRouter initialEntries={["/c/orders"]}><Harness/></MemoryRouter>]
];

const settle = async () => {
    await act(async () => {
        await new Promise(r => setTimeout(r, 20));
    });
};

describe.each(routers)("the side panel under %s", (_, mountRouter) => {

    async function openDirtyNewEntity() {
        render(mountRouter());
        await act(async () => {
            controller.open(panel("orders/", "/c/orders#new_side"));
        });
        await settle();

        // Typing into the new entity, as `EntitySidePanel.onValuesModified` reports it.
        await act(async () => {
            panelContext.setBlockedNavigationMessage(UNSAVED_MESSAGE);
            panelContext.setBlocked(true);
        });
        await settle();
        expect(panelContext.blocked).toBe(true);
    }

    const here = () => screen.getByTestId("here").textContent;

    it("reaches the saved entity's address after \"Create\" without asking about unsaved changes", async () => {
        await openDirtyNewEntity();
        expect(here()).toBe("/c/orders#new_side");

        // "Create": the form reports itself clean, and the panel moves to the
        // entity it just created — in one tick, as `onSaveSuccess` does.
        await act(async () => {
            panelContext.setBlockedNavigationMessage(undefined);
            panelContext.setBlocked(false);
            controller.replace(panel("orders/7", "/c/orders/7#side"));
        });
        await settle();

        expect(screen.queryByText(UNSAVED_MESSAGE)).toBeNull();
        expect(here()).toBe("/c/orders/7#side");
        expect(controller.sidePanels.map(p => p.key)).toEqual(["orders/7"]);
    });

    it("still asks before closing a dirty entity", async () => {
        await openDirtyNewEntity();

        await act(async () => {
            panelContext.close();
        });
        await settle();

        expect(screen.queryByText(UNSAVED_MESSAGE)).not.toBeNull();
        expect(here()).toBe("/c/orders#new_side");
        expect(controller.sidePanels.map(p => p.key)).toEqual(["orders/"]);
    });
});
