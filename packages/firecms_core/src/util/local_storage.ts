/**
 * `localStorage` access that never throws.
 *
 * Merely reading `window.localStorage` throws a SecurityError when the browser
 * blocks site data (all cookies blocked, some sandboxed iframes), and `setItem`
 * throws when the quota is full. Nothing the CMS keeps there is worth failing a
 * render over, so a failed read counts as "nothing stored" and a failed write
 * is dropped.
 *
 * @internal
 */
export function getLocalStorageItem(key: string): string | null {
    try {
        return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    } catch {
        return null;
    }
}

/**
 * The stored JSON value for `key`, or `fallback` when there is none, it is not
 * valid JSON, or storage cannot be read.
 *
 * @internal
 */
export function getLocalStorageJSON<T>(key: string, fallback: T): T {
    const item = getLocalStorageItem(key);
    if (!item) return fallback;
    try {
        return JSON.parse(item);
    } catch {
        return fallback;
    }
}

/** @internal */
export function setLocalStorageItem(key: string, value: string): void {
    try {
        if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    } catch {
        // Blocked or full: the value lives only as long as the page.
    }
}

/** @internal */
export function removeLocalStorageItem(key: string): void {
    try {
        if (typeof window !== "undefined") window.localStorage.removeItem(key);
    } catch {
        // Blocked: nothing was stored to remove.
    }
}
