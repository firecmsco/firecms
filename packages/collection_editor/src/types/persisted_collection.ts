import { EntityCollection, User } from "@firecms/core";

export type PersistedCollection<M extends Record<string, any> = any, USER extends User = User>
    = Omit<EntityCollection<M, USER>, "subcollections"> & {
    ownerId?: string;
    subcollections?: PersistedCollection<any, any>[];
    editable?: boolean;
}
