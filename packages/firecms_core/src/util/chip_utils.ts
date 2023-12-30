import { hashString } from "./hash";
import { CHIP_COLORS, ChipColorKey, ChipColorScheme } from "@firecms/ui";

export function getColorSchemeForSeed(seed: string): ChipColorScheme {
    const hash: number = hashString(seed);
    const colorKeys = Object.keys(CHIP_COLORS);
    const index = hash % colorKeys.length;
    return CHIP_COLORS[colorKeys[index]];
}

export function getColorSchemeForKey(key: ChipColorKey): ChipColorScheme {
    return CHIP_COLORS[key];
}
