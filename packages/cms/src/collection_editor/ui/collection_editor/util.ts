export function idToPropertiesPath(id: string): string {
    return "properties." + id.replaceAll(".", ".properties.");
}

export function namespaceToPropertiesPath(namespace?: string): string {
    return namespace
        ? "properties." + namespace.replaceAll(".", ".properties.") + ".properties"
        : "properties";
}

export function namespaceToPropertiesOrderPath(namespace?: string): string {
    return namespace
        ? "properties." + namespace.replaceAll(".", ".properties.") + ".propertiesOrder"
        : "propertiesOrder";
}

export function getFullId(propertyKey: string, propertyNamespace?: string): string {
    return propertyNamespace
        ? `${propertyNamespace}.${propertyKey}`
        : propertyKey;
}

export function getFullIdPath(propertyKey: string, propertyNamespace?: string): string {
    const keyWithNamespace = propertyNamespace
        ? `${propertyNamespace}.${propertyKey}`
        : propertyKey;
    return idToPropertiesPath(keyWithNamespace);
}
