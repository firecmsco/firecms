const HEX_COLOR = /^#([0-9A-Fa-f]{3}){1,2}$/;

/**
 * A stored brand color in its long form, if the theme code below can read it, or the
 * fallback.
 *
 * Project colors come from Firestore and can be anything: on 2026-11-10 one that
 * wasn't hex, stored through the MCP server, made `darkenColor` throw inside an
 * effect and took the whole project's CMS down.
 */
export function hexColorOr<T>(value: unknown, fallback: T): string | T {
    if (typeof value !== "string") return fallback;
    const color = value.trim();
    if (!HEX_COLOR.test(color)) return fallback;
    // Long, so the settings page's <input type="color"> doesn't show "#07F" as black.
    return color.length === 4 ? "#" + color.slice(1).split("").map((digit) => digit + digit).join("") : color;
}

export function darkenColor(hexColor: string, darkenBy = 10): string {
    // Check input validity
    if (!/^#([0-9A-Fa-f]{3}){1,2}$/.test(hexColor)) {
        throw new Error("Invalid color format");
    }

    // If shorthand form, convert to full form
    let color = hexColor.substring(1).split("");
    if (color.length === 3) {
        color = [color[0], color[0], color[1], color[1], color[2], color[2]];
    }

    // Convert to RGB values
    let r = parseInt(color[0] + color[1], 16);
    let g = parseInt(color[2] + color[3], 16);
    let b = parseInt(color[4] + color[5], 16);

    // Reduce each color component by the specified percentage (darkenBy)
    r = Math.floor(r * (1 - darkenBy / 100));
    g = Math.floor(g * (1 - darkenBy / 100));
    b = Math.floor(b * (1 - darkenBy / 100));

    // Recombine into hex and return
    return "#" +
        (r < 16 ? "0" : "") + r.toString(16) +
        (g < 16 ? "0" : "") + g.toString(16) +
        (b < 16 ? "0" : "") + b.toString(16);
}

export function hexToRgbaWithOpacity(hexColor: string, opacity = 10): string {
    // Check input validity
    if (!/^#([0-9A-Fa-f]{3}){1,2}$/.test(hexColor)) {
        throw new Error("Invalid color format");
    }

    // If shorthand form, convert to full form
    let color = hexColor.substring(1).split("");
    if (color.length === 3) {
        color = [color[0], color[0], color[1], color[1], color[2], color[2]];
    }

    // Convert to RGB values
    const r = parseInt(color[0] + color[1], 16);
    const g = parseInt(color[2] + color[3], 16);
    const b = parseInt(color[4] + color[5], 16);

    // Convert opacity to a decimal for CSS
    const alpha = opacity / 100;

    // Construct and return the RGBA color
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
