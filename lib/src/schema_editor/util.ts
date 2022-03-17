export function idToPropertiesPath(id: string): string {
    return "properties." + id.replace(".", ".properties.");
}

export function namespaceToPropertiesPath(namespace?: string): string {
    return namespace
        ? "properties." + namespace.replace(".", ".properties.") + ".properties"
        : "properties";
}

export function namespaceToPropertiesOrderPath(namespace?: string): string {
    return namespace
        ? "properties." + namespace.replace(".", ".properties.") + ".propertiesOrder"
        : "propertiesOrder";
}

export function getFullId(propertyId: string, propertyNamespace?: string): string {
    return propertyNamespace
        ? `${propertyNamespace}.${propertyId}`
        : propertyId;
}
