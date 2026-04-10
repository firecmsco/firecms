export function camelCase(str: string): string {
    if (!str) return "";
    if (str.length === 1) return str.toLowerCase();

    // Split by hyphens, underscores, or spaces and filter out empty strings
    const parts = str.split(/[-_ ]+/).filter(Boolean);

    if (parts.length === 0) return "";

    // Start with first part in lowercase
    return parts[0].toLowerCase() +
        // Transform remaining parts to have first letter uppercase
        parts.slice(1)
            .map(part => part.charAt(0).toUpperCase() + part.substring(1).toLowerCase())
            .join('');
}
