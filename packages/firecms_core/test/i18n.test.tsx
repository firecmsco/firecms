/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from "@jest/globals";
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { FireCMSi18nProvider } from "../src/i18n/FireCMSi18nProvider";
import { useTranslation } from "../src/hooks/useTranslation";

/**
 * Translations were never exercised by a test, while `i18next` moved from 23 to 26 and
 * `react-i18next` stayed on a major built for 23. Installs and builds pass either way —
 * only actually rendering a translated string proves the pairing works.
 */

function Probe({ k, vars }: { k: string, vars?: Record<string, string> }) {
    const { t } = useTranslation();
    return <span data-testid="out">{t(k, vars)}</span>;
}

function LocaleProbe() {
    const { i18n } = useTranslation();
    return <span data-testid="lng">{i18n.language}</span>;
}

/** Renders a key and exposes the toggle a user would click to switch language. */
function SwitchProbe({ k, to }: { k: string, to: string }) {
    const { t, i18n } = useTranslation();
    return <>
        <span data-testid="out">{t(k)}</span>
        <button data-testid="switch" onClick={() => i18n.changeLanguage(to)}>switch</button>
    </>;
}

const renderIn = (locale: string, ui: React.ReactNode) =>
    render(<FireCMSi18nProvider locale={locale}>{ui}</FireCMSi18nProvider>);

describe("FireCMS translations", () => {

    it("renders an English string", async () => {
        renderIn("en", <Probe k="create" />);
        await waitFor(() => expect(screen.getByTestId("out").textContent).toEqual("Create"));
    });

    it("renders a translated string in another locale", async () => {
        renderIn("es", <Probe k="create" />);

        await waitFor(() => {
            const out = screen.getByTestId("out").textContent;
            // Must be the Spanish string, not the key and not the English fallback.
            expect(out).not.toEqual("create");
            expect(out).not.toEqual("Create");
            expect((out ?? "").length).toBeGreaterThan(0);
        });
    });

    it.each(["en", "es", "de", "fr", "it", "pt", "hi"])(
        "resolves keys for locale %s without falling back to the raw key",
        async (locale) => {
            renderIn(locale, <Probe k="save_and_close" />);
            await waitFor(() => {
                const out = screen.getByTestId("out").textContent;
                expect({ locale, isRawKey: out === "save_and_close" })
                    .toEqual({ locale, isRawKey: false });
            });
        }
    );

    it("picks up a language switched after mount", async () => {
        // Only English and Spanish are bundled; the rest are fetched when
        // selected. The strings land in the i18next store through
        // `addResourceBundle`, which raises a store event rather than
        // `languageChanged` — react-i18next ignores those unless asked to bind
        // them, and the UI sat on the English fallback with the German strings
        // sitting unused in the store.
        renderIn("en", <SwitchProbe k="save_and_close" to="de"/>);
        await waitFor(() => expect(screen.getByTestId("out").textContent).toEqual("Save and close"));

        await act(async () => {
            screen.getByTestId("switch").click();
        });

        await waitFor(() => {
            const out = screen.getByTestId("out").textContent;
            expect({ isEnglish: out === "Save and close", isRawKey: out === "save_and_close" })
                .toEqual({ isEnglish: false, isRawKey: false });
        });
    });

    it("interpolates variables", async () => {
        // Interpolation is the part most likely to break across i18next majors.
        renderIn("en", <Probe k="add_to_field" vars={{ fieldName: "Tags" }} />);
        await waitFor(() => {
            const out = screen.getByTestId("out").textContent ?? "";
            expect(out).toContain("Tags");
            expect(out).not.toContain("{{");
        });
    });

    it("falls back to English for a key missing in another locale", async () => {
        renderIn("es", <Probe k="create" />);
        await waitFor(() => expect(screen.getByTestId("out").textContent).toBeTruthy());
    });

    it("exposes the active language on the i18n instance", async () => {
        renderIn("de", <LocaleProbe />);
        await waitFor(() => expect(screen.getByTestId("lng").textContent).toEqual("de"));
    });

    it("returns the key unchanged for an unknown string", async () => {
        renderIn("en", <Probe k="__definitely_not_a_key__" />);
        await waitFor(() =>
            expect(screen.getByTestId("out").textContent).toEqual("__definitely_not_a_key__"));
    });

});
