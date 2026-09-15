import { useContext, useSyncExternalStore } from "react";
import { AccessResponse } from "../types";
import {
    getLicenseStatusSnapshot,
    getServerLicenseStatusSnapshot,
    LicenseStatusContext,
    subscribeLicenseStatus
} from "../contexts/LicenseStatusContext";

/**
 * The FireCMS license status of this project: whether PRO runs on a trial, is
 * licensed, or is paused, plus the link to get a license.
 *
 * `null` until the license check answers, and when it is not sent at all
 * (`telemetry={false}` without an `apiKey`). A response from an older server
 * may lack `licenseState`; treat that as unknown. PRO features are paused when
 * `blocked` is true; use `isProPaused(status)` for that check.
 *
 * Works inside `FireCMS` and also above it, e.g. in the component that calls
 * `useBuildNavigationController`.
 *
 * @group Hooks and utilities
 */
export function useLicenseStatus(): AccessResponse | null {
    const fromContext = useContext(LicenseStatusContext);
    const published = useSyncExternalStore(
        subscribeLicenseStatus,
        getLicenseStatusSnapshot,
        getServerLicenseStatusSnapshot
    );
    return fromContext !== undefined ? fromContext : published;
}
