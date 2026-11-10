import { describe, expect, it } from "@jest/globals";
import { localeToLanguageTag, resolveLocale } from "../date_fns_locales";

// FireCMS locales are date-fns keys ("enUS", "ptBR"). On 2026-11-10 FireCMS Cloud stored
// "en_US" through the MCP server, and a key such as "enUS" itself made
// Intl.DateTimeFormat throw in DatePreview.

describe("resolveLocale", () => {

    it("keeps the keys as they are", () => {
        expect(resolveLocale("es")).toBe("es");
        expect(resolveLocale("ptBR")).toBe("ptBR");
        expect(resolveLocale("srLatn")).toBe("srLatn");
        expect(resolveLocale("en")).toBe("en");
    });

    it("reads a language tag in any spelling as its key", () => {
        expect(resolveLocale("en_US")).toBe("enUS");
        expect(resolveLocale("en-US")).toBe("enUS");
        expect(resolveLocale("EN-us")).toBe("enUS");
        expect(resolveLocale("pt-BR")).toBe("ptBR");
        expect(resolveLocale("sr-Latn")).toBe("srLatn");
        expect(resolveLocale(" de ")).toBe("de");
    });

    it("falls back to the language for a region date-fns doesn't have", () => {
        expect(resolveLocale("es-MX")).toBe("es");
        expect(resolveLocale("en-ZA")).toBe("en");
    });

    it("gives nothing for what isn't a locale", () => {
        for (const value of ["", "  ", "xx", "klingon", "not a locale", 42, null, undefined, {}]) {
            expect(resolveLocale(value)).toBeUndefined();
        }
    });
});

describe("localeToLanguageTag", () => {

    it("turns region and script keys into tags Intl accepts", () => {
        for (const [key, tag] of [["enUS", "en-US"], ["ptBR", "pt-BR"], ["srLatn", "sr-Latn"], ["faIR", "fa-IR"], ["es", "es"], ["en", "en"]]) {
            expect(localeToLanguageTag(key)).toBe(tag);
            expect(() => new Intl.DateTimeFormat(localeToLanguageTag(key))).not.toThrow();
        }
    });
});
