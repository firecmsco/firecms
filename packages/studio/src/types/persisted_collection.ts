import { EntityCollection, User } from "@rebasepro/types";

export type PersistedCollection<M extends Record<string, any> = any> = Omit<EntityCollection<M>, "subcollections"> & {
        ownerId?: string;
        subcollections?: () => PersistedCollection[];
        editable?: boolean;
        entityActions?: any[];
    }
