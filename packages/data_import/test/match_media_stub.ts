// @firecms/core reads window.matchMedia while its module loads, and jsdom has
// none. Imported before anything that loads core.
if (typeof window !== "undefined" && !window.matchMedia) {
    window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false
    })) as typeof window.matchMedia;
}

export {};
