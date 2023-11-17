import { buildCollection } from "@firecms/core";

export const usersCollectionTemplate = buildCollection({
    path: "users",
    name: "Users",
    singularName: "User",
    group: "Main",
    description: "Registered users in the app/web",
    icon: "person",
    properties: {
        displayName: {
            name: "Display name",
            dataType: "string"
        },
        email: {
            name: "Email",
            dataType: "string",
            email: true
        },
        emailVerified: {
            name: "Email verified",
            dataType: "boolean"
        },
        phone: {
            name: "Phone",
            dataType: "string"
        },
        photoURL: {
            name: "Photo URL",
            dataType: "string",
            url: "image"
        }
    },
});
