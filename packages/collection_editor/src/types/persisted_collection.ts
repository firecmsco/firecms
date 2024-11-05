import { EntityCollection, User } from "@firecms/core";

export type PersistedCollection<M extends Record<string, any> = any, USER extends User = User>
    = Omit<EntityCollection<M, USER>, "subcollections"> & {
    // properties: Properties<M>;
    ownerId?: string;
    subcollections?: PersistedCollection<any, any>[];
    editable?: boolean;
}
