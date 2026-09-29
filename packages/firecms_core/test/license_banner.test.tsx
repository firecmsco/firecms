/**
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FireCMSi18nProvider } from "../src/i18n/FireCMSi18nProvider";
import { LicenseStatusContext } from "../src/contexts/LicenseStatusContext";
import { LicenseBanner } from "../src/components/LicenseBanner";
import { AccessResponse } from "../src/types";
import { CustomizationControllerContext } from "../src/contexts/CustomizationControllerContext";
import { CustomizationController } from "../src/types";

/**
 * The banner replaces the full-screen "License needed" block: it is now the only
 * place a user learns the trial is running out, or that PRO features stopped.
 * These render it against the real English (and German) strings, so the copy
 * the user reads, with its numbers and dates filled in, is what is asserted.
 */

const SUBSCRIBE_URL = "https://app.firecms.co/subscriptions?intent=pro&projectId=demo-123";

function renderBanner(status: AccessResponse | null, locale = "en") {
    return render(
        <FireCMSi18nProvider locale={locale}>
            <LicenseStatusContext.Provider value={status}>
                <div data-testid="host"><LicenseBanner/></div>
            </LicenseStatusContext.Provider>
        </FireCMSi18nProvider>
    );
}

async function bannerText() {
    await waitFor(() => expect(screen.getByTestId("host").textContent).not.toEqual(""));
    return screen.getByTestId("host").textContent;
}

beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
});

afterEach(cleanup);

describe("LicenseBanner copy", () => {

    it("counts down the trial and links to the subscribe URL", async () => {
        renderBanner({ blocked: false, licenseState: "trial", daysLeft: 12, subscribeUrl: SUBSCRIBE_URL });

        expect(await bannerText()).toContain("FireCMS PRO trial: 12 days left in production.");
        const link = screen.getByRole("link", { name: "Get a license" });
        expect(link.getAttribute("href")).toEqual(SUBSCRIBE_URL);
    });

    it("uses the singular on the last day", async () => {
        renderBanner({ blocked: false, licenseState: "trial", daysLeft: 1, subscribeUrl: SUBSCRIBE_URL });

        expect(await bannerText()).toContain("FireCMS PRO trial: 1 day left in production.");
    });

    it("works the days out from trialEndsAt when daysLeft is missing", async () => {
        const inThreeDays = new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000).toISOString();
        renderBanner({ blocked: false, licenseState: "trial", trialEndsAt: inThreeDays });

        expect(await bannerText()).toContain("3 days left");
    });

    it("dates the end of an expired trial and says what still works", async () => {
        renderBanner({
            blocked: true,
            licenseState: "expired",
            trialEndsAt: "2026-09-01T12:00:00.000Z",
            subscribeUrl: SUBSCRIBE_URL
        });

        expect(await bannerText()).toContain("Your PRO trial ended on September 1, 2026. PRO features such as the schema editor, import/export and history are paused; your data and collections still work.");
        expect(screen.getByRole("link", { name: "Get a license" }).getAttribute("href")).toEqual(SUBSCRIBE_URL);
    });

    it("formats the date in the app's language", async () => {
        renderBanner({ blocked: true, licenseState: "expired", trialEndsAt: "2026-09-01T12:00:00.000Z" }, "de");

        await waitFor(() => expect(screen.getByTestId("host").textContent).toContain("1. September 2026"));
        expect(screen.getByTestId("host").textContent).toContain("Ihre PRO-Testphase ist am 1. September 2026 abgelaufen.");
    });

    it("still explains an expired trial without an end date", async () => {
        renderBanner({ blocked: true, licenseState: "expired" });

        expect(await bannerText()).toContain("Your PRO trial has ended. PRO features such as the schema editor, import/export and history are paused");
    });

    it("names the project a license key is not linked to", async () => {
        renderBanner({
            blocked: true,
            licenseState: "invalid_project",
            projectId: "demo-123",
            subscribeUrl: SUBSCRIBE_URL
        });

        expect(await bannerText()).toContain("This license key is not linked to project demo-123. PRO features are paused until it is.");
        expect(screen.getByRole("link", { name: "Add it to your license" }).getAttribute("href")).toEqual(SUBSCRIBE_URL);
    });

    it("says the license pays for other projects, and what is paused, when over quota", async () => {
        renderBanner({
            blocked: true,
            licenseState: "over_quota",
            licensedProjects: 2,
            linkedProjects: 3,
            subscribeUrl: SUBSCRIBE_URL
        });

        expect(await bannerText()).toContain("This project's license pays for 2 projects in production, and this is not one of them. PRO features such as the schema editor, import/export and history are paused; your data and collections still work.");
        expect(screen.getByRole("link", { name: "Update your license" }).getAttribute("href")).toEqual(SUBSCRIBE_URL);
    });

    it("uses the singular when the license pays for one project", async () => {
        renderBanner({ blocked: true, licenseState: "over_quota", licensedProjects: 1, linkedProjects: 2 });

        expect(await bannerText()).toContain("This project's license pays for 1 project in production, and it is a different one.");
    });

    it.each<[string, AccessResponse | null]>([
        ["licensed", { blocked: false, licenseState: "licensed", licensedProjects: 2, linkedProjects: 2 }],
        ["not_required", { blocked: false, licenseState: "not_required" }],
        ["whitelisted", { blocked: false, licenseState: "whitelisted" }],
        ["an old server's allowed response", { blocked: false }],
        ["an old server's blocked response", { blocked: true, message: "No license found" }],
        ["an unknown future state", { blocked: false, licenseState: "something_new" as any }],
        ["no answer yet", null]
    ])("renders nothing for %s", async (_, status) => {
        renderBanner(status);
        // Let the i18n provider settle before asserting on absence.
        await waitFor(() => expect(screen.getByTestId("host")).toBeTruthy());
        expect(screen.getByTestId("host").textContent).toEqual("");
        expect(screen.queryByRole("link")).toBeNull();
    });
});

describe("LicenseBanner link", () => {

    it("falls back to the license page for this project without a subscribe URL", async () => {
        renderBanner({ blocked: true, licenseState: "invalid_project", projectId: "demo-123" });

        await bannerText();
        expect(screen.getByRole("link").getAttribute("href"))
            .toEqual("https://app.firecms.co/subscriptions?intent=pro&projectId=demo-123");
    });

    it("does not follow a subscribe URL that is not https", async () => {
        renderBanner({ blocked: true, licenseState: "expired", subscribeUrl: "javascript:alert(1)" });

        await bannerText();
        expect(screen.getByRole("link").getAttribute("href"))
            .toEqual("https://app.firecms.co/subscriptions?intent=pro");
    });

    it("opens the license page in a new tab", async () => {
        renderBanner({ blocked: false, licenseState: "trial", daysLeft: 5, subscribeUrl: SUBSCRIBE_URL });

        await bannerText();
        const link = screen.getByRole("link");
        expect(link.getAttribute("target")).toEqual("_blank");
        expect(link.getAttribute("rel")).toContain("noopener");
    });
});

describe("LicenseBanner dismissal", () => {

    it("hides the trial banner for the rest of the session", async () => {
        renderBanner({ blocked: false, licenseState: "trial", daysLeft: 12 });
        await bannerText();

        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(screen.getByTestId("host").textContent).toEqual("");

        // A new page view in the same session.
        cleanup();
        renderBanner({ blocked: false, licenseState: "trial", daysLeft: 11 });
        await waitFor(() => expect(screen.getByTestId("host")).toBeTruthy());
        expect(screen.getByTestId("host").textContent).toEqual("");
    });

    it("shows a different state after one was dismissed", async () => {
        renderBanner({ blocked: false, licenseState: "trial", daysLeft: 12 });
        await bannerText();
        fireEvent.click(screen.getByRole("button", { name: "Close" }));

        cleanup();
        renderBanner({ blocked: true, licenseState: "expired" });
        expect(await bannerText()).toContain("Your PRO trial has ended.");
    });

    it.each<[string, AccessResponse]>([
        ["expired", { blocked: true, licenseState: "expired", trialEndsAt: "2026-09-01T12:00:00.000Z" }],
        ["invalid_project", { blocked: true, licenseState: "invalid_project", projectId: "demo-123" }],
        ["over_quota", { blocked: true, licenseState: "over_quota", licensedProjects: 1, linkedProjects: 2 }]
    ])("cannot dismiss %s", async (_, status) => {
        renderBanner(status);
        await bannerText();
        expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    });

    it("keeps working when session storage is unavailable", async () => {
        const ownDescriptor = Object.getOwnPropertyDescriptor(window, "sessionStorage");
        Object.defineProperty(window, "sessionStorage", {
            configurable: true,
            get() {
                throw new Error("blocked");
            }
        });
        try {
            renderBanner({ blocked: false, licenseState: "trial", daysLeft: 12 });
            await bannerText();
            fireEvent.click(screen.getByRole("button", { name: "Close" }));
            expect(screen.getByTestId("host").textContent).toEqual("");
        } finally {
            if (ownDescriptor) Object.defineProperty(window, "sessionStorage", ownDescriptor);
            else delete (window as any).sessionStorage;
        }
    });
});

describe("LicenseBanner PRO suggestions", () => {

    const USER_MANAGEMENT_DOCS = "https://firecms.co/docs/pro/user_management/?utm_source=firecms&utm_medium=cms_suggestion&utm_campaign=user_management";

    it("suggests user management to a team, with its size, and links to the plugin docs", async () => {
        renderBanner({
            blocked: false,
            licenseState: "not_required",
            suggestion: { plugin: "user_management", users: 7 }
        });

        expect(await bannerText()).toContain("7 people use this CMS. FireCMS PRO adds user management, with roles and per-collection permissions, free for 30 days in production.");
        const link = screen.getByRole("link", { name: "See how to add it" });
        expect(link.getAttribute("href")).toEqual(USER_MANAGEMENT_DOCS);
        expect(link.getAttribute("target")).toEqual("_blank");
    });

    it.each<[string, number | undefined]>([
        ["no count", undefined],
        ["a single person", 1],
        ["a count that is not a number", "7" as any]
    ])("leaves the number out with %s", async (_, users) => {
        renderBanner({
            blocked: false,
            licenseState: "not_required",
            suggestion: { plugin: "user_management", users }
        });

        const text = await bannerText();
        expect(text).toContain("FireCMS PRO adds user management, with roles and per-collection permissions, free for 30 days in production.");
        expect(text).not.toContain("people use this CMS");
    });

    it("suggests entity history", async () => {
        renderBanner({
            blocked: false,
            licenseState: "not_required",
            suggestion: { plugin: "entity_history" }
        });

        expect(await bannerText()).toContain("FireCMS PRO keeps a history of every change to your content and who made it, and lets you revert it. Free for 30 days in production.");
        expect(screen.getByRole("link", { name: "See how to add it" }).getAttribute("href"))
            .toEqual("https://firecms.co/docs/pro/entity_history/?utm_source=firecms&utm_medium=cms_suggestion&utm_campaign=entity_history");
    });

    it("is translated", async () => {
        renderBanner({
            blocked: false,
            licenseState: "not_required",
            suggestion: { plugin: "user_management", users: 5 }
        }, "de");

        await waitFor(() => expect(screen.getByTestId("host").textContent)
            .toContain("5 Personen nutzen dieses CMS. FireCMS PRO bringt eine Benutzerverwaltung"));
    });

    it.each<[string, AccessResponse]>([
        ["a plugin this version has no copy for", {
            blocked: false,
            licenseState: "not_required",
            suggestion: { plugin: "datatalk" as any }
        }],
        ["a malformed suggestion", { blocked: false, licenseState: "not_required", suggestion: "user_management" as any }],
        ["a licensed project", {
            blocked: false,
            licenseState: "licensed",
            suggestion: { plugin: "entity_history" }
        }],
        ["a whitelisted project", {
            blocked: false,
            licenseState: "whitelisted",
            suggestion: { plugin: "entity_history" }
        }]
    ])("shows nothing for %s", async (_, status) => {
        renderBanner(status);
        await waitFor(() => expect(screen.getByTestId("host")).toBeTruthy());
        expect(screen.getByTestId("host").textContent).toEqual("");
    });

    it.each<[string, string[]]>([
        ["a PRO plugin", ["export"]],
        ["the suggested plugin itself", ["user_management"]],
        ["a PRO plugin among custom ones", ["my_custom_plugin", "collection_editor"]]
    ])("shows nothing to an app that mounts %s", async (_, pluginKeys) => {
        // The server answers `not_required` to localhost and FireCMS Cloud
        // whatever they mount, so a suggestion can arrive at a PRO app.
        const customization = { plugins: pluginKeys.map(key => ({ key })) } as unknown as CustomizationController;
        render(
            <FireCMSi18nProvider locale={"en"}>
                <CustomizationControllerContext.Provider value={customization}>
                    <LicenseStatusContext.Provider value={{
                        blocked: false,
                        licenseState: "not_required",
                        suggestion: { plugin: "user_management", users: 7 }
                    }}>
                        <div data-testid="host"><LicenseBanner/></div>
                    </LicenseStatusContext.Provider>
                </CustomizationControllerContext.Provider>
            </FireCMSi18nProvider>
        );
        await waitFor(() => expect(screen.getByTestId("host")).toBeTruthy());
        expect(screen.getByTestId("host").textContent).toEqual("");
    });

    it("shows the suggestion to an app that mounts only its own plugins", async () => {
        const customization = { plugins: [{ key: "my_custom_plugin" }] } as unknown as CustomizationController;
        render(
            <FireCMSi18nProvider locale={"en"}>
                <CustomizationControllerContext.Provider value={customization}>
                    <LicenseStatusContext.Provider value={{
                        blocked: false,
                        licenseState: "not_required",
                        suggestion: { plugin: "entity_history" }
                    }}>
                        <div data-testid="host"><LicenseBanner/></div>
                    </LicenseStatusContext.Provider>
                </CustomizationControllerContext.Provider>
            </FireCMSi18nProvider>
        );
        expect(await bannerText()).toContain("FireCMS PRO keeps a history of every change");
    });

    it("keeps the trial banner when a trial response also carries a suggestion", async () => {
        renderBanner({
            blocked: false,
            licenseState: "trial",
            daysLeft: 12,
            suggestion: { plugin: "entity_history" }
        });

        const text = await bannerText();
        expect(text).toContain("FireCMS PRO trial: 12 days left in production.");
        expect(text).not.toContain("history");
    });

    it("stays dismissed in this browser after the session ends", async () => {
        const status: AccessResponse = {
            blocked: false,
            licenseState: "not_required",
            suggestion: { plugin: "user_management", users: 7 }
        };
        renderBanner(status);
        await bannerText();

        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(screen.getByTestId("host").textContent).toEqual("");

        // A later session in the same browser.
        cleanup();
        sessionStorage.clear();
        renderBanner(status);
        await waitFor(() => expect(screen.getByTestId("host")).toBeTruthy());
        expect(screen.getByTestId("host").textContent).toEqual("");
    });

    it("shows a different suggestion after one was dismissed", async () => {
        renderBanner({
            blocked: false,
            licenseState: "not_required",
            suggestion: { plugin: "user_management", users: 7 }
        });
        await bannerText();
        fireEvent.click(screen.getByRole("button", { name: "Close" }));

        cleanup();
        renderBanner({ blocked: false, licenseState: "not_required", suggestion: { plugin: "entity_history" } });
        expect(await bannerText()).toContain("FireCMS PRO keeps a history of every change");
    });

    it("does not hide the trial banner when a suggestion was dismissed", async () => {
        renderBanner({ blocked: false, licenseState: "not_required", suggestion: { plugin: "entity_history" } });
        await bannerText();
        fireEvent.click(screen.getByRole("button", { name: "Close" }));

        cleanup();
        renderBanner({ blocked: false, licenseState: "trial", daysLeft: 30 });
        expect(await bannerText()).toContain("FireCMS PRO trial: 30 days left in production.");
    });

    it("keeps working when local storage is unavailable", async () => {
        // Only the banner's own key fails: the i18n provider reads local storage too.
        const getItem = Storage.prototype.getItem;
        const setItem = Storage.prototype.setItem;
        const failOwnKey = (key: string) => {
            if (key === "firecms_pro_suggestions_dismissed") throw new Error("blocked");
        };
        Storage.prototype.getItem = function (key: string) {
            failOwnKey(key);
            return getItem.call(this, key);
        };
        Storage.prototype.setItem = function (key: string, value: string) {
            failOwnKey(key);
            return setItem.call(this, key, value);
        };
        try {
            renderBanner({ blocked: false, licenseState: "not_required", suggestion: { plugin: "entity_history" } });
            await bannerText();
            fireEvent.click(screen.getByRole("button", { name: "Close" }));
            expect(screen.getByTestId("host").textContent).toEqual("");
        } finally {
            Storage.prototype.getItem = getItem;
            Storage.prototype.setItem = setItem;
        }
    });
});
