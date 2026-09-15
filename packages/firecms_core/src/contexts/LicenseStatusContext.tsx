import React from "react";
import { AccessResponse } from "../types";

/**
 * License status of the enclosing `FireCMS`. `undefined` means there is no
 * `FireCMS` above; `null` means the check has not answered (or was skipped).
 * @internal
 */
export const LicenseStatusContext = React.createContext<AccessResponse | null | undefined>(undefined);

/*
 * The same status, published outside React's tree.
 *
 * `useBuildNavigationController` runs in the app component that renders
 * `<FireCMS>`, above it, so it cannot read the context. It still has to know
 * when PRO is paused: it applies the plugins' collection, view and home page
 * navigation contributions itself. `FireCMS` publishes here, and the navigation
 * controller subscribes with `useSyncExternalStore`.
 *
 * One value per page: two `FireCMS` instances on one page would share it, which
 * is harmless because both check the same project.
 */

let currentStatus: AccessResponse | null = null;
const listeners = new Set<() => void>();

/** @internal */
export function getLicenseStatusSnapshot(): AccessResponse | null {
    return currentStatus;
}

/** @internal */
export function getServerLicenseStatusSnapshot(): AccessResponse | null {
    return null;
}

/** @internal */
export function subscribeLicenseStatus(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** @internal */
export function publishLicenseStatus(status: AccessResponse | null): void {
    if (status === currentStatus) return;
    currentStatus = status;
    listeners.forEach(listener => listener());
}
