/**
 * Pure predicate deciding whether an in-progress navigation away from an open
 * entity form should be blocked (to warn about unsaved changes).
 *
 * Extracted from FireCMSRoute so the branching can be unit-tested without
 * mounting the router. This is an internal helper — it is intentionally not
 * re-exported from the package index.
 */
export interface NavigationBlockLocation {
    pathname: string;
    hash: string;
}

const SIDE_PANEL_HASHES = ["#side", "#new_side"];

export function shouldBlockEntityNavigation(params: {
    currentLocation: NavigationBlockLocation;
    nextLocation: NavigationBlockLocation;
    /** Path of the currently open entity (basePath + "/" + entityId). */
    entityPath: string;
    /** Collection path the entity form lives under. */
    basePath: string;
    /** Whether the form currently has unsaved modifications. */
    blocked: boolean;
}): boolean {
    const { currentLocation, nextLocation, entityPath, basePath, blocked } = params;

    // Navigating deeper within the same entity — never block.
    if (nextLocation.pathname.startsWith(entityPath))
        return false;

    // Side panel overlay navigations preserve the underlying form via
    // base_location in router state — no data is lost in either direction.

    // Opening a side panel (e.g. clicking a relation/reference arrow).
    if (SIDE_PANEL_HASHES.includes(nextLocation.hash))
        return false;

    // Closing a side panel (navigate(-1) back to the form's own path).
    if (SIDE_PANEL_HASHES.includes(currentLocation.hash) &&
        nextLocation.pathname === basePath)
        return false;

    return blocked;
}
