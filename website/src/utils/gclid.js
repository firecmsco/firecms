// Utility to get and set gclid and UTM params
// These params are stored for 90 days to match Google Ads attribution window

const STORAGE_KEY = "ad_tracking_params";
const EXPIRY_DAYS = 90;
const TRACKING_PARAMS = ["gclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

/**
 * Get tracking parameters from the current URL
 */
export function getTrackingParamsFromUrl() {
    if (typeof window === "undefined") return {};
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};

    TRACKING_PARAMS.forEach(param => {
        const value = urlParams.get(param);
        if (value) {
            params[param] = value;
        }
    });

    return params;
}

/**
 * Get stored tracking parameters from localStorage
 */
export function getStoredTrackingParams() {
    if (typeof window === "undefined") return {};

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return {};

        const data = JSON.parse(stored);

        // Check if expired
        if (data.timestamp) {
            const age = Date.now() - data.timestamp;
            const maxAge = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

            if (age > maxAge) {
                // Expired, clear storage
                localStorage.removeItem(STORAGE_KEY);
                return {};
            }
        }

        return data.params || {};
    } catch (e) {
        console.error("Error reading stored tracking params:", e);
        return {};
    }
}

/**
 * Store tracking parameters in localStorage with timestamp
 */
export function setStoredTrackingParams(params) {
    if (typeof window === "undefined" || !params || Object.keys(params).length === 0) return;

    try {
        const data = {
            params,
            timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Error storing tracking params:", e);
    }
}

/**
 * Get current tracking parameters (URL takes precedence over stored)
 */
export function getCurrentTrackingParams() {
    const urlParams = getTrackingParamsFromUrl();
    const storedParams = getStoredTrackingParams();

    // URL params override stored params
    return { ...storedParams, ...urlParams };
}

/**
 * Capture and store tracking parameters from URL on page load
 */
export function captureTrackingParams() {
    const urlParams = getTrackingParamsFromUrl();

    if (Object.keys(urlParams).length > 0) {
        // Merge with existing stored params (new params override old ones)
        const storedParams = getStoredTrackingParams();
        const mergedParams = { ...storedParams, ...urlParams };
        setStoredTrackingParams(mergedParams);
    }
}

/**
 * Append tracking parameters to a URL
 */
export function appendTrackingParamsToUrl(url, params) {
    if (!params || Object.keys(params).length === 0) return url;

    try {
        const u = new URL(url);

        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                u.searchParams.set(key, value);
            }
        });

        return u.toString();
    } catch (e) {
        console.error("Error appending tracking params to URL:", e);
        return url;
    }
}
