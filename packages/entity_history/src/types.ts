import { FireCMSContext, User } from "@firecms/core";

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
    context: FireCMSContext<User>;
    previousValues?: Partial<T>;
    values: Partial<T>;
    path: string;
    entityId: string;
}
