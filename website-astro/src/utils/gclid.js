// Utility to get and set gclid param

export function getGclidFromUrl() {
    if (typeof window === "undefined") return undefined;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("gclid");
}

export function getStoredGclid() {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem("gclid");
}

export function setStoredGclid(gclid) {
    if (typeof window === "undefined" || !gclid) return;
    localStorage.setItem("gclid", gclid);
}

export function getCurrentGclid() {
    // Prefer URL param, fallback to localStorage
    const gclid = getGclidFromUrl();
    if (gclid) return gclid;
    return getStoredGclid();
}

export function appendGclidToUrl(url, gclid) {
    return url;
    if (!gclid) return url;
    try {
        const u = new URL(url);
        if( u.searchParams.has("gclid")) {
            u.searchParams.delete("gclid");
        }
        u.searchParams.set("gclid", gclid);
        return u.toString();
    } catch {
        return url;
    }
}

