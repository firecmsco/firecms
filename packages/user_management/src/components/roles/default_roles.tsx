import { Role } from "@firecms/core";

export const DEFAULT_ROLES: Role[] = [
    {
        id: "admin",
        name: "Admin",
        isAdmin: true
    },
    {
        id: "editor",
        name: "Editor",
        isAdmin: false,
        defaultPermissions: {
            read: true,
            create: true,
            edit: true,
            delete: true
        },
        config: {
            createCollections: true,
            editCollections: "own",
            deleteCollections: "own"
        }
    },
    {
        id: "viewer",
        name: "Viewer",
        isAdmin: false,
        defaultPermissions: {
            read: true,
            create: false,
            edit: false,
            delete: false
        }
    }
];
