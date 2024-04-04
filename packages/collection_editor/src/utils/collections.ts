import {
    EntityCollection,
    joinCollectionLists,
    makePropertiesEditable,
    ModifyCollectionProps,
    Properties
} from "@firecms/core";
import { PersistedCollection } from "../types/persisted_collection";

/**
 * Function in charge of merging collections defined in code with those stored in the backend.
 */
export const mergeCollections = (baseCollections: EntityCollection[],
                                 backendCollections: PersistedCollection[],
                                 modifyCollection?: (props: ModifyCollectionProps) => EntityCollection | void
) => {

    const markAsEditable = (c: PersistedCollection) => {
        makePropertiesEditable(c.properties as Properties);
        c.subcollections?.forEach(markAsEditable);
    };
    const storedCollections = backendCollections ?? [];
    storedCollections.forEach(markAsEditable);

    console.debug("Collections specified in code:", baseCollections);
    console.debug("Collections stored in the backend", storedCollections);
    const result = joinCollectionLists(baseCollections, storedCollections, [], modifyCollection);
    console.debug("Collections after joining:", result);
    return result;
}
