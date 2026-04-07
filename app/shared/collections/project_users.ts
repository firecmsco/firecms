import { EntityCollection } from "@rebasepro/types";

const projectUsersCollection: EntityCollection = {
    name: "Project Users",
    singularName: "Project User",
    slug: "project_users",
    dbPath: "project_users",
    history: true,
    properties: {
        project_id: {
            name: "Project ID",
            type: "string",
            isId: true,
            validation: {
                required: true
            }
        },
        id: {
            name: "User ID",
            type: "string",
            isId: true,
            validation: {
                required: true
            }
        },
        email: {
            name: "Email",
            type: "string",
            email: true,
            validation: {
                required: true
            }
        },
        role: {
            name: "Role",
            type: "string",
            enum: [
                { id: "admin", label: "Admin" },
                { id: "editor", label: "Editor" },
                { id: "viewer", label: "Viewer" }
            ],
            validation: {
                required: false
            }
        }
    }
};

export default projectUsersCollection;
