import { EntityCollection, FieldConfig } from "../../types";
import { isReferenceProperty } from "./property_utils";
import { isPropertyBuilder } from "./entities";

export function getReferencePreviewKeys(targetCollection: EntityCollection<any>,
                                        fields: Record<string, FieldConfig>,
                                        previewProperties?: string[],
                                        limit = 3) {
    const allProperties = Object.keys(targetCollection.properties);
    let listProperties = previewProperties?.filter(p => allProperties.includes(p as string));
    if (listProperties && listProperties.length > 0) {
        return listProperties;
    } else {
        listProperties = allProperties;
        return listProperties.filter(key => {
            const propertyOrBuilder = targetCollection.properties[key];
            return propertyOrBuilder && !isPropertyBuilder(propertyOrBuilder) && !isReferenceProperty(propertyOrBuilder, fields);
        }).slice(0, limit);
    }
}
