import { Properties, Property, PropertyOrBuilder, isPropertyBuilder } from "@firecms/core";

/**
 * Recursively extract all property paths from a Properties object.
 * For nested map properties, creates dot-notation paths like "address.city".
 * Skips PropertyBuilder functions (callbacks) as they cannot be statically analyzed.
 * 
 * @param properties - The properties object to extract paths from
 * @param prefix - Optional prefix for nested paths (used in recursion)
 * @returns Array of property path strings
 */
export function getPropertyPaths(
    properties: Properties | undefined,
    prefix: string = ""
): string[] {
    if (!properties) return [];

    const paths: string[] = [];

    for (const [key, propertyOrBuilder] of Object.entries(properties)) {
        if (!propertyOrBuilder) continue;

        // Skip PropertyBuilder functions - they require runtime values to resolve
        if (isPropertyBuilder(propertyOrBuilder)) continue;

        const property = propertyOrBuilder as Property;
        const fullPath = prefix ? `${prefix}.${key}` : key;
        paths.push(fullPath);

        // Recursively add nested map properties
        if (property.dataType === "map" && property.properties) {
            const nestedPaths = getPropertyPaths(
                property.properties as Properties,
                fullPath
            );
            paths.push(...nestedPaths);
        }

        // For arrays with object items, add the nested paths too
        if (property.dataType === "array" && property.of) {
            const ofPropertyOrBuilder = property.of as PropertyOrBuilder;
            // Skip if the array's 'of' is a PropertyBuilder
            if (!isPropertyBuilder(ofPropertyOrBuilder)) {
                const ofProperty = ofPropertyOrBuilder as Property;
                if (ofProperty.dataType === "map" && ofProperty.properties) {
                    const nestedPaths = getPropertyPaths(
                        ofProperty.properties as Properties,
                        `${fullPath}[]`
                    );
                    paths.push(...nestedPaths);
                }
            }
        }
    }

    return paths;
}

/**
 * Get property paths grouped by top-level property for UI display.
 * Skips PropertyBuilder functions.
 * 
 * @param properties - The properties object
 * @returns Object with top-level keys mapping to their nested paths
 */
export function getGroupedPropertyPaths(
    properties: Properties | undefined
): Record<string, string[]> {
    if (!properties) return {};

    const grouped: Record<string, string[]> = {};

    for (const [key, propertyOrBuilder] of Object.entries(properties)) {
        if (!propertyOrBuilder) continue;

        // Skip PropertyBuilder functions
        if (isPropertyBuilder(propertyOrBuilder)) continue;

        const property = propertyOrBuilder as Property;
        grouped[key] = [key];

        if (property.dataType === "map" && property.properties) {
            const nestedPaths = getPropertyPaths(
                property.properties as Properties,
                key
            );
            grouped[key].push(...nestedPaths);
        }
    }

    return grouped;
}
