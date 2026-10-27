/**
 * @jest-environment jsdom
 */
import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * The app bar's left edge is shared with the drawer: the title has to land in
 * the same place whether or not a Drawer is mounted, and the logo the bar shows
 * in a drawer's absence has to sit where the drawer's own logo would be.
 * Getting that wrong is visible as a jump when navigating between a screen with
 * a drawer and one without.
 */

let appState = { hasDrawer: false, drawerOpen: false, logo: undefined as string | undefined };
let largeLayout = true;

jest.mock("../src/app/useApp", () => ({
    useApp: () => appState
}));

jest.mock("../src/hooks", () => ({
    useLargeLayout: () => largeLayout,
    useNavigationController: () => ({ basePath: "/" }),
    useAuthController: () => ({ user: null, initialLoading: false, signOut: jest.fn() }),
    useModeController: () => ({ mode: "light", setMode: jest.fn() }),
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } })
}));

let breadcrumbs: { title: string, url: string, id?: string, count?: number | null }[] = [];
jest.mock("../src/hooks/useBreadcrumbsController", () => ({
    useBreadcrumbsController: () => ({ breadcrumbs })
}));

// Also keeps the DefaultAppBar -> DefaultDrawer -> ../components import cycle
// out of the test module graph.
jest.mock("../src/core/DefaultDrawer", () => ({
    DrawerLogo: () => <div data-testid="drawer-logo"/>
}));

jest.mock("../src/components", () => ({
    ErrorBoundary: ({ children }: any) => <>{children}</>,
    LanguageToggle: () => null
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DefaultAppBar } = require("../src/core/DefaultAppBar");

function renderBar() {
    const { container } = render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <DefaultAppBar title="FireCMS Cloud" includeModeToggle={false}/>
        </MemoryRouter>
    );
    return container.firstElementChild as HTMLElement;
}

/** The left padding the bar reserves, which is what positions the title. */
function leftPaddingClass(bar: HTMLElement): string | undefined {
    return bar.className.split(/\s+/).find(c => c.startsWith("pl-"));
}

describe("DefaultAppBar layout", () => {

    beforeEach(() => {
        appState = { hasDrawer: false, drawerOpen: false, logo: undefined };
        largeLayout = true;
        breadcrumbs = [];
    });

    it("reserves the same left edge with a collapsed drawer and with none", () => {
        appState = { hasDrawer: false, drawerOpen: false, logo: undefined };
        const withoutDrawer = leftPaddingClass(renderBar());

        appState = { hasDrawer: true, drawerOpen: false, logo: undefined };
        const withDrawer = leftPaddingClass(renderBar());

        expect(withoutDrawer).toBe("pl-24");
        expect(withDrawer).toBe(withoutDrawer);
    });

    it("follows the drawer when it is pinned open", () => {
        appState = { hasDrawer: true, drawerOpen: true, logo: undefined };
        expect(leftPaddingClass(renderBar())).toBe("pl-[19rem]");
    });

    it("shows the drawer's own logo when no drawer is mounted", () => {
        appState = { hasDrawer: false, drawerOpen: false, logo: undefined };
        renderBar();
        expect(screen.getByTestId("drawer-logo")).toBeTruthy();
    });

    it("leaves the logo to the drawer when one is mounted", () => {
        appState = { hasDrawer: true, drawerOpen: false, logo: undefined };
        renderBar();
        expect(screen.queryByTestId("drawer-logo")).toBeNull();
    });

    /**
     * `useLargeLayout` resolves at min-width 1025px while Tailwind's `lg:`
     * starts at 1024px. Gating the logo on the CSS breakpoint instead of the
     * hook put it on screen at exactly 1024px in a bar that had not reserved
     * room for it, on top of the title.
     */
    it("does not show the logo on a small layout, where no room is reserved", () => {
        appState = { hasDrawer: false, drawerOpen: false, logo: undefined };
        largeLayout = false;
        const bar = renderBar();
        expect(screen.queryByTestId("drawer-logo")).toBeNull();
        expect(leftPaddingClass(bar)).toBeUndefined();
    });

    it("still reserves the rail on a small layout when a drawer is mounted", () => {
        appState = { hasDrawer: true, drawerOpen: false, logo: undefined };
        largeLayout = false;
        expect(leftPaddingClass(renderBar())).toBe("pl-24");
    });

    it("renders the title", () => {
        renderBar();
        expect(screen.getByText("FireCMS Cloud")).toBeTruthy();
    });
});

describe("DefaultAppBar breadcrumbs", () => {

    beforeEach(() => {
        appState = { hasDrawer: false, drawerOpen: false, logo: undefined };
        largeLayout = true;
    });

    /** The row of breadcrumbs large screens show. */
    const row = (bar: HTMLElement) => bar.querySelector(".hidden.lg\\:block.mr-8") as HTMLElement;
    /** The breadcrumbs folded on two lines, which small screens show instead. */
    const folded = (bar: HTMLElement) => bar.querySelector(".lg\\:hidden") as HTMLElement | null;

    /** What follows a breadcrumb's title in the row: its count, if any. */
    const countInRow = (bar: HTMLElement, title: string) =>
        within(row(bar)).getByText(title).nextElementSibling as HTMLElement | null;

    const subcollection = [
        { title: "Products", url: "/c/products", id: "products" },
        { title: "p1", url: "/c/products/p1" },
        { title: "Locales", url: "/c/products/p1/locales", id: "products/p1/locales", count: 3 }
    ];

    describe("in a row, on large screens", () => {

        it("shows the count of the collection being viewed", () => {
            breadcrumbs = [{ title: "Products", url: "/c/products", id: "products", count: 42 }];
            expect(countInRow(renderBar(), "Products")?.textContent).toBe("42");
        });

        it("shows a count of zero", () => {
            breadcrumbs = [{ title: "Products", url: "/c/products", id: "products", count: 0 }];
            expect(countInRow(renderBar(), "Products")?.textContent).toBe("0");
        });

        it("shows a placeholder while the count loads", () => {
            breadcrumbs = [{ title: "Products", url: "/c/products", id: "products", count: null }];
            const placeholder = countInRow(renderBar(), "Products");
            expect(placeholder).toBeTruthy();
            expect(placeholder!.textContent).toBe("");
        });

        it("shows no count for entities and parent collections", () => {
            breadcrumbs = subcollection;
            const bar = renderBar();
            expect(countInRow(bar, "Products")).toBeNull();
            expect(countInRow(bar, "p1")).toBeNull();
            expect(countInRow(bar, "Locales")?.textContent).toBe("3");
        });

        it("links every breadcrumb", () => {
            breadcrumbs = subcollection;
            const links = within(row(renderBar())).getAllByRole("link").map(a => a.getAttribute("href"));
            expect(links).toEqual(["/c/products", "/c/products/p1", "/c/products/p1/locales"]);
        });

        it("is hidden on small screens", () => {
            breadcrumbs = subcollection;
            expect(row(renderBar()).className).toContain("hidden");
        });
    });

    describe("folded, on small screens", () => {

        it("shows a subcollection's name and count under its parents", () => {
            breadcrumbs = subcollection;
            const title = folded(renderBar())!;
            expect(title.firstElementChild!.textContent).toBe("Products / p1");
            expect(within(title).getByText("Locales").nextElementSibling?.textContent).toBe("3");
        });

        it("shows a top level collection's name and count alone", () => {
            breadcrumbs = [{ title: "Products", url: "/c/products", id: "products", count: 2 }];
            const title = folded(renderBar())!;
            expect(title.children.length).toBe(1);
            expect(within(title).getByText("Products").nextElementSibling?.textContent).toBe("2");
        });

        it("shows an entity without a count", () => {
            breadcrumbs = subcollection.slice(0, 2);
            const title = folded(renderBar())!;
            expect(title.firstElementChild!.textContent).toBe("Products");
            expect(within(title).getByText("p1").nextElementSibling).toBeNull();
        });

        it("shows a placeholder while the count loads", () => {
            breadcrumbs = [{ title: "Products", url: "/c/products", id: "products", count: null }];
            const placeholder = within(folded(renderBar())!).getByText("Products").nextElementSibling;
            expect(placeholder).toBeTruthy();
            expect(placeholder!.textContent).toBe("");
        });

        it("is hidden on large screens, which show the row", () => {
            breadcrumbs = subcollection;
            expect(folded(renderBar())!.className).toContain("lg:hidden");
        });

        /** A row of them on a phone pushed the account menu, with "Log out", out of the bar. */
        it("can shrink rather than push the buttons after it out of the bar", () => {
            breadcrumbs = subcollection;
            expect(folded(renderBar())!.className).toContain("min-w-0");
        });

        it("is not there without breadcrumbs", () => {
            breadcrumbs = [];
            expect(folded(renderBar())).toBeNull();
        });
    });
});
