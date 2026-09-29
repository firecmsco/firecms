/**
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { FireCMSi18nProvider } from "../src/i18n/FireCMSi18nProvider";
import { useBuildModeController } from "../src/hooks/useBuildModeController";
import { useBuildLocalConfigurationPersistence } from "../src/hooks/useBuildLocalConfigurationPersistence";
import { addRecentId, getRecentIds } from "../src/components/EntityCollectionView/utils";

/**
 * Where the browser blocks site data (all cookies blocked, some sandboxed
 * iframes), merely reading `window.localStorage` or `window.sessionStorage`
 * throws a SecurityError. The CMS keeps only preferences there, so it has to
 * render without them rather than show a blank page.
 */

const STORAGE_KEYS = ["localStorage", "sessionStorage"] as const;
let ownDescriptors: Partial<Record<typeof STORAGE_KEYS[number], PropertyDescriptor>> = {};

function blockStorage() {
    for (const key of STORAGE_KEYS) {
        ownDescriptors[key] = Object.getOwnPropertyDescriptor(window, key);
        Object.defineProperty(window, key, {
            configurable: true,
            get() {
                throw new DOMException("The operation is insecure.", "SecurityError");
            }
        });
    }
}

function restoreStorage() {
    for (const key of STORAGE_KEYS) {
        const descriptor = ownDescriptors[key];
        if (descriptor) Object.defineProperty(window, key, descriptor);
        else delete (window as any)[key];
    }
    ownDescriptors = {};
}

/** Reads a key through the same channel application code uses. */
function Str({ k }: { k: string }) {
    const { t } = useTranslation("firecms_core");
    return <span data-testid={k}>{t(k)}</span>;
}

beforeEach(() => {
    window.localStorage.clear();
    blockStorage();
});

afterEach(() => {
    cleanup();
    restoreStorage();
});

describe("with site storage blocked", () => {

    it("the storage getter really throws", () => {
        expect(() => window.localStorage).toThrow("insecure");
        expect(() => window.sessionStorage).toThrow("insecure");
    });

    it("FireCMSi18nProvider renders its children in the locale it was given", () => {
        render(
            <FireCMSi18nProvider locale={"es"}>
                <Str k={"save"}/>
            </FireCMSi18nProvider>
        );
        expect(screen.getByTestId("save").textContent).toBe("Guardar");
    });

    it("FireCMSi18nProvider switches language without storing the choice", async () => {
        let changeLanguage: ((lng: string) => Promise<unknown>) | undefined;

        function Switcher() {
            const { i18n } = useTranslation("firecms_core");
            changeLanguage = (lng) => i18n.changeLanguage(lng);
            return null;
        }

        render(
            <FireCMSi18nProvider locale={"en"}>
                <Switcher/>
                <Str k={"save"}/>
            </FireCMSi18nProvider>
        );
        expect(screen.getByTestId("save").textContent).toBe("Save");

        await act(async () => {
            await changeLanguage!("es");
        });
        expect(screen.getByTestId("save").textContent).toBe("Guardar");
    });

    it("FireCMSi18nProvider follows a new locale prop", () => {
        const { rerender } = render(
            <FireCMSi18nProvider locale={"en"}>
                <Str k={"save"}/>
            </FireCMSi18nProvider>
        );
        rerender(
            <FireCMSi18nProvider locale={"es"}>
                <Str k={"save"}/>
            </FireCMSi18nProvider>
        );
        expect(screen.getByTestId("save").textContent).toBe("Guardar");
    });

    it("useBuildModeController starts from the system preference and switches mode", () => {
        const matchMedia = window.matchMedia;
        window.matchMedia = ((query: string) => ({
            matches: true,
            media: query,
            addEventListener: () => undefined,
            removeEventListener: () => undefined
        })) as any;
        try {
            const { result } = renderHook(() => useBuildModeController());
            expect(result.current.mode).toBe("dark");

            act(() => result.current.setMode("light"));
            expect(result.current.mode).toBe("light");

            act(() => result.current.setMode("system"));
            expect(result.current.mode).toBe("dark");
        } finally {
            window.matchMedia = matchMedia;
        }
    });

    it("useBuildLocalConfigurationPersistence keeps its state in memory", () => {
        const { result } = renderHook(() => useBuildLocalConfigurationPersistence());
        expect(result.current.favouritePaths).toEqual([]);
        expect(result.current.getCollectionConfig("products")).toEqual({});

        act(() => result.current.setFavouritePaths(["products"]));
        act(() => result.current.setRecentlyVisitedPaths(["orders"]));
        act(() => result.current.setCollapsedGroups(["Admin"]));
        expect(result.current.favouritePaths).toEqual(["products"]);
        expect(result.current.recentlyVisitedPaths).toEqual(["orders"]);
        expect(result.current.collapsedGroups).toEqual(["Admin"]);

        expect(() => result.current.onCollectionModified("products", { name: "Items" })).not.toThrow();
    });

    it("recent id searches read as none", () => {
        expect(getRecentIds("products")).toEqual([]);
        expect(addRecentId("products", "abc")).toEqual(["abc"]);
    });

    it("the entity cache module loads, and only its memory cache keeps entities", () => {
        jest.isolateModules(() => {
            // Required here, not imported: its storage check runs when the module loads.
            const cache = require("../src/util/entity_cache");
            cache.saveEntityToMemoryCache("products/abc", { name: "Chair" });
            expect(cache.getEntityFromMemoryCache("products/abc")).toEqual({ name: "Chair" });

            expect(() => cache.saveEntityToCache("products/abc", { name: "Chair" })).not.toThrow();
            expect(cache.getEntityFromCache("products/abc")).toBeUndefined();
        });
    });
});

describe("with a corrupt stored value", () => {

    beforeEach(() => {
        restoreStorage();
    });

    it("reads it as nothing stored", () => {
        window.localStorage.setItem("favourite_paths", "{not json");
        window.localStorage.setItem("recent_id_searches::products", "[");

        const { result } = renderHook(() => useBuildLocalConfigurationPersistence());
        expect(result.current.favouritePaths).toEqual([]);
        expect(getRecentIds("products")).toEqual([]);
    });
});
