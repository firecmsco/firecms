/**
 * @jest-environment jsdom
 */
import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import React from "react";
import { render, screen } from "@testing-library/react";
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

jest.mock("../src/hooks/useBreadcrumbsController", () => ({
    useBreadcrumbsController: () => ({ breadcrumbs: [] })
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
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
