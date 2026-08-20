/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { FireCMSi18nProvider } from "../FireCMSi18nProvider";

/** Reads a key through the same channel application code uses. */
function Str({ k }: { k: string }) {
    const { t } = useTranslation("firecms_core");
    return <span data-testid={k}>{t(k)}</span>;
}

const HOST_TRANSLATIONS = {
    en: {
        host_only_key: "Explore your Firestore data",
        save: "Publish"      // an override of a real core key
    }
} as any;

describe("FireCMSi18nProvider", () => {

    beforeEach(() => {
        window.localStorage.clear();
    });

    it("resolves its own translations", () => {
        render(
            <FireCMSi18nProvider translations={HOST_TRANSLATIONS}>
                <Str k={"host_only_key"}/>
            </FireCMSi18nProvider>
        );
        expect(screen.getByTestId("host_only_key").textContent).toBe("Explore your Firestore data");
    });

    it("keeps the host's translations when a nested provider is mounted without any", () => {
        // This is the FireCMSCloudApp case: it mounts its own provider with
        // `translations={appConfig?.translations}`, which is undefined for every
        // project that has not deployed custom code. A nested provider that built its
        // own isolated instance would shadow the host's and render the raw key.
        render(
            <FireCMSi18nProvider translations={HOST_TRANSLATIONS}>
                <FireCMSi18nProvider translations={undefined}>
                    <Str k={"host_only_key"}/>
                </FireCMSi18nProvider>
            </FireCMSi18nProvider>
        );
        expect(screen.getByTestId("host_only_key").textContent).toBe("Explore your Firestore data");
        expect(screen.getByTestId("host_only_key").textContent).not.toBe("host_only_key");
    });

    it("does not let a nested provider clobber a host override", () => {
        render(
            <FireCMSi18nProvider translations={HOST_TRANSLATIONS}>
                <FireCMSi18nProvider translations={undefined}>
                    <Str k={"save"}/>
                </FireCMSi18nProvider>
            </FireCMSi18nProvider>
        );
        expect(screen.getByTestId("save").textContent).toBe("Publish");
    });

    it("lets a nested provider add its own translations on top of the host's", () => {
        render(
            <FireCMSi18nProvider translations={HOST_TRANSLATIONS}>
                <FireCMSi18nProvider translations={{ en: { nested_key: "From the nested provider" } } as any}>
                    <>
                        <Str k={"host_only_key"}/>
                        <Str k={"nested_key"}/>
                    </>
                </FireCMSi18nProvider>
            </FireCMSi18nProvider>
        );
        expect(screen.getByTestId("host_only_key").textContent).toBe("Explore your Firestore data");
        expect(screen.getByTestId("nested_key").textContent).toBe("From the nested provider");
    });

    it("still serves the built-in core strings through a nested provider", () => {
        render(
            <FireCMSi18nProvider>
                <FireCMSi18nProvider translations={undefined}>
                    <Str k={"discard"}/>
                </FireCMSi18nProvider>
            </FireCMSi18nProvider>
        );
        const el = screen.getByTestId("discard");
        expect(el.textContent).not.toBe("discard");
        expect(el.textContent?.length).toBeGreaterThan(0);
    });
});
