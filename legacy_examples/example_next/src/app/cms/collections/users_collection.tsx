import { buildCollection } from "@firecms/core";

export const usersCollection = buildCollection({
    slug: "users",
    dbPath: "users",
    name: "Users",
    singularName: "User",
    group: "E-commerce",
    description: "Registered users",
    textSearchEnabled: true,
    icon: "Person",
    properties: {
        first_name: {
            name: "First name",
            type: "string"
        },
        last_name: {
            name: "Last name",
            type: "string"
        },
        email: {
            name: "Email",
            type: "string",
            email: true
        },
        phone: {
            name: "Phone",
            type: "string"
        },
        related_users: {
            type: "array",
            name: "Related users",
            of: {
                type: "reference",
                path: "users"
}
        },
        liked_products: {
            type: "array",
            name: "Liked products",
            description: "Products this user has liked",
            of: {
                type: "reference",
                path: "products"
            }
        },
        picture: {
            name: "Picture",
            type: "map",
            properties: {
                large: {
                    name: "Large",
                    type: "string",
                    url: "image"
                },
                thumbnail: {
                    name: "Thumbnail",
                    type: "string",
                    url: "image"
                }
            },
            previewProperties: ["large"]
        }
    },
    additionalFields: [
        {
            key: "sample_additional",
            name: "Sample additional",
            Builder: ({ entity }) => <>{`Generated column: ${entity.values.first_name}`}</>,
            dependencies: ["first_name"]
        }
    ]
});
