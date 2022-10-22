import { EntityCollection } from "./collections";

/**
 * Used to override collections based on the collection path and entityId.
 * @category Models
 */
export type CollectionOverrideHandler = (props: {
    entityId?: string,
    path: string
}) => Partial<EntityCollection<any>> | undefined;
