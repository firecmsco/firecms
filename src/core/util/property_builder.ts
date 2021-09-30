import {
    CMSType,
    EntityValues,
    Property,
    PropertyOrBuilder
} from "../../models";


export function buildPropertyFrom<T extends CMSType, M extends { [Key: string]: any }>(
    propertyOrBuilder: PropertyOrBuilder<T, M>,
    values: Partial<EntityValues<M>>,
    path: string,
    entityId?: string
): Property<T> {
    if (typeof propertyOrBuilder === "function") {
        return propertyOrBuilder({ values, entityId, path });
    } else {
        return propertyOrBuilder;
    }
}
