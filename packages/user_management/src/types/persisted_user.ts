import { User } from "@firecms/core";

export type PersistedUser = User & {
    updated_on?: Date;
    created_on?: Date;
}
