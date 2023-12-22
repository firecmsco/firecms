import { EntityCollection, makePropertiesEditable } from "@firecms/core";

export const usersCollectionTemplate: EntityCollection = {
    id: "users",
    path: "users",
    name: "Users",
    singularName: "User",
    description: "Registered users in the app/web",
    icon: "person",
    properties: makePropertiesEditable({
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
    }),
};
