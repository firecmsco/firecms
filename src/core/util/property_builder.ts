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
): Property<T> | null {
    let result: any;
    if (typeof propertyOrBuilder === "function") {
        result = propertyOrBuilder({ values, previousValues, entityId, path });
        if (!result) {
            console.debug("Property builder not returning `Property` so it is not rendered", path, entityId, propertyOrBuilder);
            return null;
        }
    } else {
        result = propertyOrBuilder;
    }
    if (propertyOverride)
        result = mergeDeep(result, propertyOverride);

    return result;
}
