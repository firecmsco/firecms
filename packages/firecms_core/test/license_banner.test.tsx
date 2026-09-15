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

    it("compares covered and linked projects when over quota", async () => {
        renderBanner({
            blocked: false,
            licenseState: "over_quota",
            licensedProjects: 2,
            linkedProjects: 3,
            subscribeUrl: SUBSCRIBE_URL
        });

        expect(await bannerText()).toContain("This license covers 2 projects and 3 are linked to it.");
        expect(screen.getByRole("link", { name: "Update your license" })).toBeTruthy();
    });

    it("uses the singular when the license covers one project", async () => {
        renderBanner({ blocked: false, licenseState: "over_quota", licensedProjects: 1, linkedProjects: 2 });

        expect(await bannerText()).toContain("This license covers 1 project and 2 are linked to it.");
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
        renderBanner({ blocked: false, licenseState: "over_quota", licensedProjects: 1, linkedProjects: 2 });
        expect(await bannerText()).toContain("This license covers 1 project");
    });

    it("lets the over-quota banner be dismissed", async () => {
        renderBanner({ blocked: false, licenseState: "over_quota", licensedProjects: 1, linkedProjects: 2 });
        await bannerText();

        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(screen.getByTestId("host").textContent).toEqual("");
    });

    it.each<[string, AccessResponse]>([
        ["expired", { blocked: true, licenseState: "expired", trialEndsAt: "2026-09-01T12:00:00.000Z" }],
        ["invalid_project", { blocked: true, licenseState: "invalid_project", projectId: "demo-123" }]
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
