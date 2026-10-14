/**
 * @jest-environment jsdom
 *
 * Links keep working while a side panel has unsaved changes.
 *
 * The panel's guard used to cancel every click on a same-host `<a href>` while
 * the form was dirty, to show its unsaved-changes dialog instead. That dialog
 * stopped opening for navigations when the dirty entity cache arrived
 * (171a43a0e), but the cancelling stayed: a plain link, or one opening in a new
 * tab, did nothing at all. Unsaved values are cached, and a link that leaves
 * the page still meets the browser's own "Leave site?" prompt, which is what
 * the guard keeps.
 */
import { describe, expect, it } from "@jest/globals";
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, useLocation } from "react-router-dom";
import { SideDialogController, SideDialogs, useSideDialogContext } from "../src/core/SideDialogs";
import { useBuildSideDialogsController } from "../src/internal/useBuildSideDialogsController";
import { SideDialogsControllerContext } from "../src/contexts/SideDialogsControllerContext";
import { SideDialogsController } from "../src/types";

let controller: SideDialogsController;
let panelContext: SideDialogController;

/** An entity form with links in it, as markdown fields and custom views render them. */
function PanelForm() {
    panelContext = useSideDialogContext();
    return <div>
        <a href="/c/products">Plain link</a>
        <a href="/c/products" target="_blank" rel="noreferrer">New tab link</a>
        <Link to="/c/products">Router link</Link>
    </div>;
}

function Harness() {
    controller = useBuildSideDialogsController();
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

async function openPanel(dirty: boolean) {
    render(<MemoryRouter initialEntries={["/c/orders"]}><Harness/></MemoryRouter>);
    await act(async () => {
        controller.open({
            key: "orders/7",
            component: <PanelForm/>,
            urlPath: "/c/orders/7#side",
            parentUrlPath: "/c/orders"
        });
    });
    await settle();
    if (dirty) {
        await act(async () => {
            panelContext.setBlocked(true);
        });
        await settle();
    }
    expect(panelContext.blocked).toBe(dirty);
}

/**
 * Whether the browser would follow a click on this link, i.e. nothing in the
 * app cancelled it. Read after every app listener has run, then cancelled so
 * that jsdom does not try to load another document.
 */
function browserFollows(link: HTMLElement): boolean {
    let followed = false;
    const record = (e: Event) => {
        followed = !e.defaultPrevented;
        e.preventDefault();
    };
    window.addEventListener("click", record);
    try {
        fireEvent.click(link);
    } finally {
        window.removeEventListener("click", record);
    }
    return followed;
}

function leavingThePageAsks(): boolean {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
}

describe("links in a side panel with unsaved changes", () => {

    it("follows a plain link", async () => {
        await openPanel(true);
        expect(browserFollows(screen.getByText("Plain link"))).toBe(true);
    });

    it("follows a link that opens in a new tab", async () => {
        await openPanel(true);
        expect(browserFollows(screen.getByText("New tab link"))).toBe(true);
    });

    it("navigates with a router link", async () => {
        await openPanel(true);
        await act(async () => {
            fireEvent.click(screen.getByText("Router link"));
        });
        await settle();
        expect(here()).toBe("/c/products");
    });

    it("still asks before the page is left", async () => {
        await openPanel(true);
        expect(leavingThePageAsks()).toBe(true);
    });

    it("lets the page go once the changes are saved", async () => {
        await openPanel(true);
        await act(async () => {
            panelContext.setBlocked(false);
        });
        await settle();
        expect(leavingThePageAsks()).toBe(false);
    });
});
