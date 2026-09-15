/**
 * What the FireCMS license check says about this project.
 *
 * - `not_required`: no PRO plugin is mounted.
 * - `whitelisted`: the project is exempt from licensing.
 * - `licensed`: a license covers this project.
 * - `trial`: PRO plugins run on the free trial; see `daysLeft` and `trialEndsAt`.
 * - `expired`: the trial ended without a license. PRO plugins are paused.
 * - `invalid_project`: a license key was presented, but this project is not
 *   linked to that license. PRO plugins are paused.
 * - `over_quota`: the license has more projects linked than it pays for.
 *   Nothing is paused.
 *
 * @group Models
 */
export type LicenseState =
    | "not_required"
    | "whitelisted"
    | "licensed"
    | "trial"
    | "expired"
    | "invalid_project"
    | "over_quota";

/**
 * Response of the FireCMS license check (`POST https://api.firecms.co/access_log`).
 *
 * Servers older than the PRO relaunch send only `blocked` and `message`, so
 * treat a missing `licenseState` as unknown. `blocked` is honoured either way.
 *
 * @group Models
 */
export type AccessResponse = {
    /**
     * True when the PRO plugins must be paused. The core CMS is never blocked.
     */
    blocked?: boolean;
    licenseState?: LicenseState;
    /**
     * Number of projects the license pays for. Present with `licensed` and `over_quota`.
     */
    licensedProjects?: number;
    /**
     * Number of projects linked to the license.
     */
    linkedProjects?: number;
    projectId?: string;
    licenseId?: string;
    /**
     * ISO date the trial ends or ended. Present with `trial` and `expired`.
     */
    trialEndsAt?: string;
    /**
     * Whole days left in the trial, present with `trial`.
     */
    daysLeft?: number;
    /**
     * Where to get or update a license for this project.
     */
    subscribeUrl?: string;
    message?: string;
};
