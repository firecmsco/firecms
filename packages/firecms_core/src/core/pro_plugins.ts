import { AccessResponse, FireCMSPlugin } from "../types";

/**
 * Keys of the plugins that need a FireCMS PRO license.
 *
 * Kept in sync by hand with `PRO_PLUGIN_KEYS` in
 * `saas_backend/functions/src/business_rules/licenses.ts`, which decides from
 * the same list whether a project needs a license. Change both together.
 *
 * @group Core
 */
export const PRO_PLUGIN_KEYS: readonly string[] = [
    "collection_editor",
    "user_management",
    "import_export",
    "import",
    "export",
    "entity_history",
    "data_enhancement",
    "datatalk"
];

/**
 * PRO plugins that stay mounted while PRO is paused. `user_management` supplies
 * sign-in checks and roles, so removing it would lock users out of the CMS
 * instead of pausing a feature; its own Users and Roles views show a notice.
 */
const KEPT_WHILE_PAUSED: readonly string[] = ["user_management"];

/**
 * Whether PRO features are paused for this license status. Any `blocked`
 * response pauses them, whatever its `licenseState` (`expired` and
 * `invalid_project` both come with it). An unknown status pauses nothing.
 *
 * @group Core
 */
export function isProPaused(licenseStatus?: AccessResponse | null): boolean {
    return Boolean(licenseStatus?.blocked);
}

/**
 * Whether this plugin is dropped while PRO is paused.
 *
 * @group Core
 */
export function isPausedPlugin(plugin: Pick<FireCMSPlugin, "key">): boolean {
    return PRO_PLUGIN_KEYS.includes(plugin.key) && !KEPT_WHILE_PAUSED.includes(plugin.key);
}

/**
 * Where to get or fix the license for this status: the server's
 * `subscribeUrl` when it is an https URL, otherwise the license page on
 * app.firecms.co with the project, when known.
 *
 * @group Core
 */
export function getLicenseSubscribeUrl(licenseStatus?: AccessResponse | null): string {
    const subscribeUrl = licenseStatus?.subscribeUrl;
    if (subscribeUrl && /^https:\/\//i.test(subscribeUrl))
        return subscribeUrl;
    const params = new URLSearchParams({ intent: "pro" });
    if (licenseStatus?.projectId) params.set("projectId", licenseStatus.projectId);
    return `https://app.firecms.co/subscriptions?${params.toString()}`;
}

/**
 * The plugins that stay active under this license status. Returns the same
 * array when nothing is dropped, so it can feed memo and effect dependencies.
 *
 * @group Core
 */
export function filterPausedPlugins<P extends Pick<FireCMSPlugin, "key">>(
    plugins: P[] | undefined,
    licenseStatus?: AccessResponse | null
): P[] | undefined {
    if (!plugins || !isProPaused(licenseStatus)) return plugins;
    const active = plugins.filter(plugin => !isPausedPlugin(plugin));
    return active.length === plugins.length ? plugins : active;
}
