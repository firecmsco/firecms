import { EntityCollection, Properties, User } from "@firecms/core";

export type PersistedCollection<M extends Record<string, any> = any,  UserType extends User = User>
    = Omit<EntityCollection<M, UserType>, "properties" | "subcollections"> & {
    properties: Properties<M>;
    ownerId: string;
    subcollections?: PersistedCollection<any, any>[];
}
