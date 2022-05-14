import { Role } from "@camberi/firecms";

export type SassUser = {
    email: string;
    name: string;
    roles: Role[];
    active: boolean;
}
