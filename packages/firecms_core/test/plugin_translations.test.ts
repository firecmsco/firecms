/**
 * Plugin translation injection.
 *
 * `FireCMS` writes each plugin's strings into the live i18next instance from an
 * effect keyed on `[i18n, plugins]`, and subscribes to that same instance with
 * `useTranslation`. `FireCMSCloudApp` builds `plugins` as an inline array
 * literal, and two of the hooks feeding it — `useCollectionEditorPlugin` and
 * `useSaasPlugin` — call `useTranslation` themselves, so the component owning
 * that array is a store subscriber too.
 *
 * Since locale bundles began arriving after init, the provider binds store
 * events so they repaint. That closes a path from the write back to the effect
 * that produced it, which is why writing the same bundle twice must be a no-op.
 */
import { describe, expect, it, jest } from "@jest/globals";
import { applyPluginTranslations, createAppliedBundles } from "../src/core/plugin_translations";

const EN = { create: "Create" };
const DE = { create: "Erstellen" };

function fakeI18n() {
    return { addResourceBundle: jest.fn() } as any;
}

describe("applyPluginTranslations", () => {

    it("writes each bundle exactly once, however often it is called", () => {
        const i18n = fakeI18n();
        const applied = createAppliedBundles();
        const plugins = [{ name: "p", i18n: { en: EN, de: DE } }] as any;

        for (let i = 0; i < 20; i++) {
            applyPluginTranslations({ i18n, plugins, language: "en", applied });
        }

        expect(i18n.addResourceBundle).toHaveBeenCalledTimes(2);
    });

    it("writes again for a bundle it has not seen, on the same locale", () => {
        const i18n = fakeI18n();
        const applied = createAppliedBundles();

        applyPluginTranslations({ i18n, plugins: [{ i18n: { en: EN } }] as any, language: "en", applied });
        // A second plugin contributing its own English strings must still land.
        applyPluginTranslations({ i18n, plugins: [{ i18n: { en: { save: "Save" } } }] as any, language: "en", applied });

        expect(i18n.addResourceBundle).toHaveBeenCalledTimes(2);
    });

    it("resolves a lazily loaded locale only for the active language and English", async () => {
        const i18n = fakeI18n();
        const loadIt = jest.fn(async () => ({ create: "Crea" }));
        const loadDe = jest.fn(async () => DE);
        const plugins = [{ i18n: { en: EN, it: loadIt, de: loadDe } }] as any;

        applyPluginTranslations({ i18n, plugins, language: "it", applied: createAppliedBundles() });
        await Promise.resolve();

        expect(loadIt).toHaveBeenCalledTimes(1);
        expect(loadDe).not.toHaveBeenCalled();
    });

    it("does not write a late-arriving bundle after the caller is gone", async () => {
        const i18n = fakeI18n();
        let active = true;
        const plugins = [{ i18n: { de: async () => DE } }] as any;

        applyPluginTranslations({
            i18n, plugins, language: "de", applied: createAppliedBundles(), isActive: () => active
        });
        active = false;
        await Promise.resolve();
        await Promise.resolve();

        expect(i18n.addResourceBundle).not.toHaveBeenCalled();
    });

    it("keeps working when a lazily loaded locale fails", async () => {
        const i18n = fakeI18n();
        const plugins = [{ i18n: { en: EN, de: async () => { throw new Error("offline"); } } }] as any;

        expect(() => applyPluginTranslations({
            i18n, plugins, language: "de", applied: createAppliedBundles()
        })).not.toThrow();
        await Promise.resolve();
        await Promise.resolve();

        // English still went in; the failed locale simply falls back to it.
        expect(i18n.addResourceBundle).toHaveBeenCalledTimes(1);
    });
});
