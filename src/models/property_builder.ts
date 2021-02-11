import {
    EntitySchema,
    EntityValues,
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
