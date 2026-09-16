/**
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FireCMS } from "../src/core/FireCMS";
import { FireCMSi18nProvider } from "../src/i18n/FireCMSi18nProvider";
import { useBuildNavigationController } from "../src/hooks/useBuildNavigationController";
import { useCustomizationController } from "../src/hooks/useCustomizationController";
import { useNavigationController } from "../src/hooks/useNavigationController";
import { useLicenseStatus } from "../src/hooks/useLicenseStatus";
import { getLicenseStatusSnapshot, publishLicenseStatus } from "../src/contexts/LicenseStatusContext";
import { AccessResponse, EntityCollection, FireCMSPlugin } from "../src/types";

/**
 * The license check used to replace the whole CMS with a "License needed"
 * screen. These render `FireCMS` the way an app does, with the navigation
 * controller built above it, against a stubbed `/access_log`, and check that
 * the CMS always renders, that only PRO plugins pause (in both places plugins
 * contribute), and that `telemetry={false}` sends nothing only when there is
 * neither a key nor a PRO plugin.
 */

const collections: EntityCollection[] = [
    { id: "products", name: "Products", path: "products", properties: {} }
];

const withProvider = (key: string, extra: Partial<FireCMSPlugin> = {}): FireCMSPlugin => ({
    key,
    provider: {
        Component: ({ children }: { children?: React.ReactNode }) =>
            <div data-testid={`provider-${key}`}>{children}</div>
    },
    ...extra
});

const PLUGINS: FireCMSPlugin[] = [
    withProvider("user_management", { userManagement: { users: [], getUser: () => null } as any }),
    withProvider("collection_editor"),
    withProvider("entity_history", {
        collection: { modifyCollection: (collection) => ({ ...collection, history: true }) }
    }),
    withProvider("datatalk"),
    { key: "export", collectionView: { CollectionActions: [] } },
    withProvider("media_manager")
];
const ALL_KEYS = PLUGINS.map(p => p.key);

const dataSourceDelegate = { key: "firestore", initialised: true } as any;
const storageSource = {} as any;

const authFor = (uid: string) => ({
    user: { uid, email: `${uid}@example.com` },
    initialLoading: false,
    authLoading: false,
    getAuthToken: async () => "id-token",
    signOut: async () => undefined,
    extra: null,
    setExtra: () => undefined
}) as any;

let fetchMock: jest.Mock<any>;

function stubAccessLog(response: AccessResponse) {
    fetchMock = jest.fn(async () => ({ json: async () => response }));
    (global as any).fetch = fetchMock;
}

function requestBodies(): any[] {
    return fetchMock.mock.calls.map((call: any[]) => JSON.parse(call[1].body));
}

function Probe() {
    const customizationController = useCustomizationController();
    const navigation = useNavigationController();
    const licenseStatus = useLicenseStatus();
    return <div>
        <div data-testid="app">app content</div>
        <div data-testid="active">{(customizationController.plugins ?? []).map(p => p.key).join(",")}</div>
        <div data-testid="state">{licenseStatus?.licenseState ?? "none"}</div>
        <div data-testid="history">{String(navigation.getCollection("products")?.history ?? false)}</div>
    </div>;
}

function App({ authController, apiKey, telemetry, plugins = PLUGINS }: {
    authController: any,
    apiKey?: string,
    telemetry?: boolean,
    plugins?: FireCMSPlugin[]
}) {
    const navigationController = useBuildNavigationController({
        collections,
        plugins,
        authController,
        dataSourceDelegate
    });
    // Above FireCMS, where the navigation controller is built.
    const statusAbove = useLicenseStatus();
    return <>
        <div data-testid="state-above">{statusAbove?.licenseState ?? "none"}</div>
        <FireCMS
            navigationController={navigationController}
            authController={authController}
            dataSourceDelegate={dataSourceDelegate}
            storageSource={storageSource}
            apiKey={apiKey}
            telemetry={telemetry}>
            {({ loading }) => loading ? <div data-testid="loading"/> : <Probe/>}
        </FireCMS>
    </>;
}

function renderApp(props: { authController?: any, apiKey?: string, telemetry?: boolean, plugins?: FireCMSPlugin[] } = {}) {
    const authController = props.authController ?? authFor("u1");
    const ui = (p: typeof props) => (
        <FireCMSi18nProvider locale="en">
            <MemoryRouter>
                <App authController={p.authController ?? authController} apiKey={p.apiKey} telemetry={p.telemetry}
                     plugins={p.plugins}/>
            </MemoryRouter>
        </FireCMSi18nProvider>
    );
    const rendered = render(ui(props));
    return {
        ...rendered,
        rerenderWith: (next: typeof props) => rendered.rerender(ui({ ...props, ...next }))
    };
}

beforeEach(() => {
    jest.spyOn(console, "debug").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
    cleanup();
    act(() => publishLicenseStatus(null));
    jest.restoreAllMocks();
    delete (global as any).fetch;
});

describe("FireCMS under a blocked license", () => {

    it.each(["expired", "invalid_project", "over_quota"] as const)(
        "keeps rendering the CMS and pauses every PRO plugin except user_management (%s)",
        async (licenseState) => {
            stubAccessLog({ blocked: true, licenseState, projectId: "demo-123", licensedProjects: 1, linkedProjects: 2 });
            renderApp();

            await waitFor(() => expect(screen.getByTestId("state").textContent).toEqual(licenseState));

            expect(screen.getByTestId("app").textContent).toEqual("app content");
            expect(screen.queryByText("License needed")).toBeNull();

            // Inside FireCMS: providers and customization-level contributions.
            expect(screen.getByTestId("active").textContent).toEqual("user_management,media_manager");
            expect(screen.queryByTestId("provider-user_management")).not.toBeNull();
            expect(screen.queryByTestId("provider-media_manager")).not.toBeNull();
            expect(screen.queryByTestId("provider-collection_editor")).toBeNull();
            expect(screen.queryByTestId("provider-entity_history")).toBeNull();
            expect(screen.queryByTestId("provider-datatalk")).toBeNull();

            // In the navigation controller, built above FireCMS.
            await waitFor(() => expect(screen.getByTestId("history").textContent).toEqual("false"));
        });

    it("pauses on an old server's blocked response, which has no licenseState", async () => {
        stubAccessLog({ blocked: true, message: "No license found for project: demo-123" });
        renderApp();

        await waitFor(() => expect(screen.getByTestId("active").textContent).toEqual("user_management,media_manager"));
        expect(screen.getByTestId("app").textContent).toEqual("app content");
    });

    it("sends every plugin key, including the paused ones, on each check", async () => {
        stubAccessLog({ blocked: true, licenseState: "expired" });
        const { rerenderWith } = renderApp();
        await waitFor(() => expect(screen.getByTestId("state").textContent).toEqual("expired"));
        expect(requestBodies()[0].plugins).toEqual(ALL_KEYS);

        // Another user signs in after the pause: still every key.
        rerenderWith({ authController: authFor("u2") });
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
        expect(requestBodies()[1].plugins).toEqual(ALL_KEYS);
    });

    it("publishes the status above FireCMS, and clears it when FireCMS unmounts", async () => {
        stubAccessLog({ blocked: true, licenseState: "expired" });
        const { unmount } = renderApp();

        await waitFor(() => expect(screen.getByTestId("state-above").textContent).toEqual("expired"));

        unmount();
        expect(getLicenseStatusSnapshot()).toBeNull();
    });
});

describe("FireCMS when PRO is not paused", () => {

    it.each<[string, AccessResponse]>([
        ["trial", { blocked: false, licenseState: "trial", daysLeft: 12 }],
        ["licensed", { blocked: false, licenseState: "licensed" }]
    ])("keeps every plugin for %s", async (state, response) => {
        stubAccessLog(response);
        renderApp();

        await waitFor(() => expect(screen.getByTestId("state").textContent).toEqual(state));
        expect(screen.getByTestId("active").textContent).toEqual(ALL_KEYS.join(","));
        expect(screen.queryByTestId("provider-collection_editor")).not.toBeNull();
        expect(screen.getByTestId("history").textContent).toEqual("true");
    });

    it("keeps every plugin when the check fails", async () => {
        (global as any).fetch = fetchMock = jest.fn(async () => {
            throw new Error("offline");
        });
        renderApp();

        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });
        expect(screen.getByTestId("state").textContent).toEqual("none");
        expect(screen.getByTestId("active").textContent).toEqual(ALL_KEYS.join(","));
    });
});

describe("telemetry", () => {

    async function settle() {
        await waitFor(() => expect(screen.queryByTestId("app")).not.toBeNull());
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });
    }

    it("sends the check by default", async () => {
        stubAccessLog({ blocked: false, licenseState: "not_required" });
        renderApp();
        await settle();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toEqual("https://api.firecms.co/access_log");
    });

    it("sends nothing with telemetry={false}, no apiKey and no PRO plugin", async () => {
        stubAccessLog({ blocked: false, licenseState: "not_required" });
        renderApp({ telemetry: false, plugins: [withProvider("media_manager")] });
        await settle();

        expect(fetchMock).not.toHaveBeenCalled();
        expect(screen.getByTestId("active").textContent).toEqual("media_manager");
    });

    it("still sends the license check with telemetry={false} when a PRO plugin is mounted", async () => {
        // Otherwise telemetry={false} would skip the trial clock and never pause PRO.
        stubAccessLog({ blocked: true, licenseState: "expired" });
        renderApp({ telemetry: false });
        await settle();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(requestBodies()[0].plugins).toEqual(ALL_KEYS);
        await waitFor(() => expect(screen.getByTestId("active").textContent).toEqual("user_management,media_manager"));
    });

    it("still sends the license check with telemetry={false} when there is an apiKey", async () => {
        stubAccessLog({ blocked: false, licenseState: "licensed" });
        renderApp({ telemetry: false, apiKey: "license-key" });
        await settle();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(requestBodies()[0].apiKey).toEqual("license-key");
    });
});
