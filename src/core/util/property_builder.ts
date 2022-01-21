import {
    CMSType,
    EntityValues,
    Property,
    PropertyOrBuilder
} from "../../models";
import { mergeDeep } from "./objects";


export function buildPropertyFrom<T extends CMSType, M extends { [Key: string]: any }>
({
     propertyOrBuilder,
     values,
     previousValues,
     path,
     entityId,
     propertyOverride
 }: {
     propertyOrBuilder: PropertyOrBuilder<T, M>,
     values: Partial<EntityValues<M>>,
     previousValues?: Partial<EntityValues<M>>,
     path: string,
     entityId?: string,
     propertyOverride?: Partial<Property<T>>
 }
): Property<T> {
    let result: any;
    if (typeof propertyOrBuilder === "function") {
        result = propertyOrBuilder({ values, previousValues, entityId, path });
        if (!result) {
            console.error("Wrong function", path, entityId, propertyOrBuilder);
            throw Error("Not returning property from property builder");
        }
    } else {
        result = propertyOrBuilder;
    }
    if (propertyOverride)
        result = mergeDeep(result, propertyOverride);

    return result;
}
