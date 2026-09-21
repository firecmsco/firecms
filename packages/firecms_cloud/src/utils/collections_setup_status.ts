/**
 * The `collectionsSetup` status the backend keeps on the project, as far as
 * this module needs it. Structurally the same as `CollectionsSetupInfo`.
 */
type SetupStatus = {
    status: string,
    updated_at?: { toDate: () => Date } | Date | null
} | undefined | null;

/**
 * After this long an "ongoing" setup cannot still be running: the backend
 * function that runs it is killed after 300 seconds.
 */
export const ONGOING_SETUP_STALE_MS = 10 * 60 * 1000;

/**
 * Whether a collection setup is actually still running.
 *
 * The backend writes "ongoing" when a setup starts and "complete" or "error"
 * when it ends, so a setup whose process dies in between stays "ongoing" for
 * good, and every setup button on the project spun forever. Eight projects
 * were in that state in Sep 2026, all written before the status carried a
 * timestamp. So an "ongoing" status with no timestamp, or an old one, is
 * treated as over.
 */
export function isCollectionsSetupOngoing(setup: SetupStatus, now: number = Date.now()): boolean {
    if (setup?.status !== "ongoing") return false;
    const startedAt = setupUpdatedAt(setup);
    if (!startedAt) return false;
    return now - startedAt.getTime() < ONGOING_SETUP_STALE_MS;
}

/**
 * When an ongoing setup will count as stale (epoch ms), or undefined when it
 * already does, or is not ongoing.
 */
export function setupStaleAt(setup: SetupStatus, now: number = Date.now()): number | undefined {
    if (!isCollectionsSetupOngoing(setup, now)) return undefined;
    return setupUpdatedAt(setup)!.getTime() + ONGOING_SETUP_STALE_MS;
}

function setupUpdatedAt(setup: SetupStatus): Date | undefined {
    const updatedAt = setup?.updated_at;
    if (!updatedAt) return undefined;
    return updatedAt instanceof Date ? updatedAt : updatedAt.toDate();
}
