import {
    EntitySchema,
    EntityValues,
    EnumValueConfig,
    Property,
    PropertyOrBuilder
} from "./models";

export function buildProperty<S extends EntitySchema<Key>, Key extends string, T extends any = any>(
    propertyOrBuilder: PropertyOrBuilder<S, Key, T>,
    values: Partial<EntityValues<S, Key>>,
    entityId?: string
): Property<T> {
    if (typeof propertyOrBuilder === "function") {
        return propertyOrBuilder({ values, entityId });
    } else {
        return propertyOrBuilder;
    }
}

export function buildEnumLabel(
    labelOrConfig?: string | EnumValueConfig
): string | undefined {
    if (!labelOrConfig)
        return undefined;
    if (typeof labelOrConfig === "object") {
        return labelOrConfig.label;
    } else {
        return labelOrConfig;
    }
}

export function isEnumValueDisabled(labelOrConfig?: string | EnumValueConfig) {
    return typeof labelOrConfig === "object" && (labelOrConfig as EnumValueConfig).disabled;
}
