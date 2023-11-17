import { EntityCollection, Properties, User } from "@firecms/core";

export type PersistedCollection<M extends Record<string, any> = any, AdditionalKey extends string = string, UserType extends User = User>
    = Omit<EntityCollection<M, AdditionalKey, UserType>, "properties" | "subcollections"> & {
    properties: Properties<M>;
    ownerId: string;
    subcollections?: PersistedCollection<any, any>[];
}
