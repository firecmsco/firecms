import { EntityCollection, RebaseContext, User } from "@rebasepro/core";

export type HistoryEntryMetadata<T> = {
    previous_values?: Partial<T>;
    changed_fields: string[] | null;
    updated_on: Date;
    updated_by: string | null;
};

export type HistoryEntry<T> = Partial<T> & {
    __metadata: HistoryEntryMetadata<T>;
};

export interface NewHistoryEntryParams<T = any> {
    context: RebaseContext<User>;
    previousValues?: Partial<T>;
    values: Partial<T>;
    path: string;
    entityId: string | number;
    collection?: EntityCollection;
}
