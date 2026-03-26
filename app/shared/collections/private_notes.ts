import { EntityCollection } from "@rebasepro/types";

const privateNotesCollection: EntityCollection = {
    name: "Private Notes",
    singularName: "Private Note",
    slug: "private_notes",
    dbPath: "private_notes",
    icon: "Lock",
    description: "Demonstrates Supabase-style RLS policies. Users can only access their own notes. Admins can read all. Locked notes cannot be updated.",
    securityRules: [
        {
            name: "admin_bypass",
            operation: "all",
            roles: [
                "admin"
            ],
            using: "true"
        },
        {
            name: "owner_access",
            operation: "all",
            ownerField: "user_id"
        },
        {
            name: "no_update_locked",
            operation: "update",
            mode: "restrictive",
            using: "{is_locked} = false",
            withCheck: "{is_locked} = false"
        }
    ],
    callbacks: {
        beforeSave: ({ values, context, status }) => {
            if (status === "new" && !values.user_id) {
                // Ensure we handle both frontend (authController) and backend (user) context contexts.
                values.user_id = context.user?.uid ?? (context as any).authController?.user?.uid;
            }
            return values;
        }
    },
    properties: {
        id: {
            name: "ID2",
            type: "string",
            isId: "uuid"
        },
        title: {
            name: "Title",
            type: "string",
            validation: {
                required: true
            },
            columnType: "varchar"
        },
        content: {
            name: "Content",
            type: "string",
            multiline: true
        },
        user_id: {
            name: "User ID",
            type: "string",
            disabled: true,
            description: "The ID of the user who owns this note"
        },
        is_locked: {
            name: "Locked",
            type: "boolean",
            description: "When true, RLS restrictive policy prevents updates"
        }
    }
};

export default privateNotesCollection;
