import { Role } from "@camberi/firecms";

export type SassUser = {
    id: string;
    email: string;
    name: string;
    roles: Role[];
    active: boolean;
}
