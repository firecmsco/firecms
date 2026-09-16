/**
 * Rules the scaffolder applies to what the user gives it. Kept apart from `commands/init.ts`
 * so they can be tested directly: that module reads `import.meta.url`, which a CommonJS test
 * cannot load.
 */

/**
 * A Firebase project ID: 6 to 30 characters, lower case letters, digits and hyphens,
 * starting with a letter and not ending in a hyphen. Older projects can be scoped to a
 * domain (`example.com:my-project`), which the backend still accepts.
 *
 * It is written into .firebaserc, firebase.json, the deploy script and the Firebase config,
 * and went there unchecked: a quote made package.json invalid JSON.
 */
export function isFirebaseProjectId(value: string): boolean {
    const separator = value.lastIndexOf(":");
    const id = separator === -1 ? value : value.slice(separator + 1);
    const domain = separator === -1 ? "" : value.slice(0, separator);
    if (domain && !/^[a-z0-9.-]+$/.test(domain)) return false;
    return /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(id);
}

/**
 * The exact `@firecms/*` version a scaffold should use, or undefined to keep the template's
 * own range.
 *
 * The templates ask for `^3.0.0`, which resolves to the newest stable release. That is right
 * for a stable CLI, but it meant `npx @firecms/cli@canary init` scaffolded a project with
 * stable packages, so a canary could not be tried at all. A prerelease CLI pins the packages
 * to its own version instead.
 */
export function pinnedFireCMSVersion(version: string | undefined): string | undefined {
    return version?.includes("-") ? version : undefined;
}
