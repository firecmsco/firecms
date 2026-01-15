import {
    EntityCollection, getSubcollections,
    ModifyCollectionProps,
    Properties
} from "@firecms/core";
import {
    joinCollectionLists,
    makePropertiesEditable,
} from "@firecms/common";
import { PersistedCollection } from "../types/persisted_collection";

/**
 * Function in charge of merging collections defined in code with those stored in the backend.
 */
export const mergeCollections = (baseCollections: EntityCollection[],
                                 backendCollections: PersistedCollection[] = [],
                                 modifyCollection?: (props: ModifyCollectionProps) => EntityCollection | void
) => {

    const markAsEditable = (c: PersistedCollection) => {
        makePropertiesEditable(c.properties as Properties);
        getSubcollections(c).forEach(markAsEditable);
    };

    backendCollections.forEach(markAsEditable);

    const result = joinCollectionLists(baseCollections, backendCollections, [], modifyCollection);

    // sort the collections so they are in the same order as the base collections
    result.sort((a, b) => {
        const indexA = baseCollections.findIndex(c => c.slug === a.slug);
        const indexB = baseCollections.findIndex(c => c.slug === b.slug);

        if (indexA === -1 && indexB === -1) {
            return 0; // Keep original order for items not in baseCollections
        }
        if (indexA === -1) {
            return 1; // a is not in base, so it goes to the end
        }
        if (indexB === -1) {
            return -1; // b is not in base, so it goes to the end
        }
        return indexA - indexB;
    });

    return result;
}
