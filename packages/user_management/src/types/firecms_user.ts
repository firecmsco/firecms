import { User } from "@firecms/core";
import { Role } from "./roles";

export type UserWithRoles = User & {
    updated_on?: Date;
    created_on?: Date;
    roles: Role[];
}
