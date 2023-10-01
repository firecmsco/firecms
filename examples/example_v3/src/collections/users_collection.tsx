import { buildCollection } from "firecms";

export const usersCollection = buildCollection({
    path: "users",
    name: "Users",
    singularName: "User",
    group: "Main",
    description: "Registered users",
    textSearchEnabled: true,
    icon: "Person",
    properties: {
        first_name: {
            name: "First name",
            dataType: "string"
        },
        last_name: {
            name: "Last name",
            dataType: "string"
        },
        email: {
            name: "Email",
            dataType: "string",
            email: true
        },
        phone: {
            name: "Phone",
            dataType: "string"
        },
        liked_products: {
            dataType: "array",
            name: "Liked products",
            description: "Products this user has liked",
            of: {
                dataType: "reference",
                path: "products"
            }
        },
        picture: {
            name: "Picture",
            dataType: "map",
            properties: {
                large: {
                    name: "Large",
                    dataType: "string",
                    url: "image"
                },
                thumbnail: {
                    name: "Thumbnail",
                    dataType: "string",
                    url: "image"
                }
            },
            previewProperties: ["large"]
        }
    },
    additionalFields: [
        {
            id: "sample_additional",
            name: "Sample additional",
            Builder: ({ entity }) => <>{`Generated column: ${entity.values.first_name}`}</>,
            dependencies: ["first_name"]
        }
    ]
});
