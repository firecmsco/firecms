import { EntityCollection } from "../../models";
import { isReferenceProperty } from "./property_utils";

export function getReferencePreviewKeys(targetCollection: EntityCollection<any>,
                                        previewProperties?: string[],
                                        limit: number = 3) {
    const allProperties = Object.keys(targetCollection.properties);
    let listProperties = previewProperties?.filter(p => allProperties.includes(p as string));
    if (listProperties && listProperties.length > 0) {
        return listProperties;
    } else {
        listProperties = allProperties;
        return listProperties.filter(key => {
            const propertyOrBuilder = targetCollection.properties[key];
            return propertyOrBuilder && !isReferenceProperty(propertyOrBuilder);
        }).slice(0, limit);
    }
}
