/**
 * Icon export contract.
 *
 * The ~2200 icon components are a published API: a tenant bundle built long ago
 * resolves `@firecms/ui` out of the host's share scope and imports these by name,
 * so a name that disappears takes that bundle down with an undefined component.
 *
 * `api-surface.test.ts` only checks the set did not collapse. This checks the
 * two ways a regeneration can silently drop a name:
 *
 *  - the count going backwards, and
 *  - the handful of exports whose name does not follow `keyToIconComponent`.
 *    Those exist because two different ligatures derive the same component name
 *    (`add_chart` and `addchart`), so the generator's dedup keeps one and the
 *    other survives only as a hand-held alias. A regeneration that re-derived
 *    every name from the key list would lose them without failing anything else.
 */
import * as UI from "../src";
import * as GeneratedIcons from "../src/icons/generated_icons";
import { iconKeys } from "../src/icons/icon_keys";
import { keyToIconComponent } from "../src/util/key_to_icon_component";

/** The set size at the time the per-icon files collapsed into a factory. */
const BASELINE_ICON_COUNT = 2198;

/** Exports whose name is not what `keyToIconComponent` derives from their key. */
const ALIASED_EXPORTS = ["AddChartIcon", "LocalPrintshopIcon", "PanoramaFisheyeIcon"];

const iconExports = Object.keys(UI).filter((name) => /Icon$/.test(name));

describe("@firecms/ui icon export contract", () => {

    it("exports at least as many icons as the baseline", () => {
        expect(iconExports.length).toBeGreaterThanOrEqual(BASELINE_ICON_COUNT);
    });

    it.each(ALIASED_EXPORTS)("still exports the aliased name %s", (name) => {
        expect((UI as Record<string, unknown>)[name]).toBeDefined();
    });

    it("exports a component for every icon key, modulo derivation collisions", () => {
        const missing = iconKeys
            .map((key) => keyToIconComponent(key))
            .filter((name) => name !== "Icon")
            .filter((name) => !(name in UI));
        // A key whose derived name collides with an earlier one is deduped away
        // by the generator, so some absences are expected; a large number is not.
        expect(missing.length).toBeLessThan(20);
    });

    it("gives every generated icon a displayName", () => {
        // The three hand-written icons (GitHub, Handle, Firestore) never had one.
        const withoutDisplayName = Object.keys(GeneratedIcons).filter((name) => {
            const component = (GeneratedIcons as Record<string, any>)[name];
            return typeof component?.displayName !== "string";
        });
        expect(withoutDisplayName).toEqual([]);
    });

    it("re-exports every generated icon from the package root", () => {
        const notReExported = Object.keys(GeneratedIcons).filter((name) => !(name in UI));
        expect(notReExported).toEqual([]);
    });
});
