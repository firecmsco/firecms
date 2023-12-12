import { Properties, slugify } from "@firecms/core";
import { ImportConfig } from "@firecms/data_import_export";

export function cleanPropertiesFromImport(properties: Properties, parentSlug = ""): {
    headersMapping: ImportConfig["headersMapping"],
    properties: Properties,
    idColumn?: ImportConfig["idColumn"],
} {

    const result = Object.keys(properties).reduce((acc, key) => {
        const property = properties[key];
        const slug = slugify(key);
        const fullSlug = parentSlug ? `${parentSlug}.${slug}` : slug;

        if (property.dataType === "map" && property.properties) {
            const slugifiedResult = cleanPropertiesFromImport(property.properties as Properties, fullSlug);
            return {
                headersMapping: { ...acc.headersMapping, [key]: fullSlug },
                properties: {
                    ...acc.properties,
                    [slug]: {
                        ...property,
                        properties: slugifiedResult.properties,
                        propertiesOrder: Object.keys(slugifiedResult.properties)
                    }
                }
            }
        }

        const updatedProperties = {
            ...acc.properties,
            [slug]: property
        } as Properties;

        const headersMapping = { ...acc.headersMapping, [key]: fullSlug } as Record<string, string>;

        return {
            headersMapping,
            properties: updatedProperties,
        }
    }, { headersMapping: {}, properties: {} });

    const firstKey = Object.keys(result.headersMapping)?.[0];
    let idColumn: string | undefined;
    if (firstKey?.includes("id") || firstKey?.includes("key")) {
        idColumn = firstKey;
    }

    return {
        ...result,
        idColumn
    };
}
