/**
 * Utility functions for the SDK generator
 */

/**
 * Convert a slug/snake_case string to PascalCase
 * e.g. "private_notes" → "PrivateNotes"
 */
export function toPascalCase(str: string): string {
    return str
        .split(/[_\-\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
}

/**
 * Convert a slug/snake_case string to camelCase
 * e.g. "private_notes" → "privateNotes"
 */
export function toCamelCase(str: string): string {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert a slug to a safe JS identifier
 * e.g. "private-notes" → "privateNotes"
 */
export function toSafeIdentifier(str: string): string {
    return toCamelCase(str.replace(/[^a-zA-Z0-9_]/g, "_"));
}

/**
 * Indent a block of text by a given number of spaces
 */
export function indent(text: string, spaces: number): string {
    const pad = " ".repeat(spaces);
    return text
        .split("\n")
        .map(line => (line.trim() ? pad + line : line))
        .join("\n");
}
