import { buildSchema } from "@camberi/firecms";

export const usersSchema = buildSchema({
    id: "user",
    name: "User",
    properties: {
        first_name: {
            title: "First name",
            dataType: "string"
        },
        last_name: {
            title: "Last name",
            dataType: "string"
        },
        email: {
            title: "Email",
            dataType: "string",
            email: true
        },
        phone: {
            title: "Phone",
            dataType: "string"
        },
        liked_products: {
            dataType: "array",
            title: "Liked products",
            description: "Products this user has liked",
            of: {
                dataType: "reference",
                path: "products"
            }
        },
        picture: {
            title: "Picture",
            dataType: "map",
            properties: {
                large: {
                    title: "Large",
                    dataType: "string",
                    url: true,
                },
                thumbnail: {
                    title: "Thumbnail",
                    dataType: "string",
                    url: true,
                }
            },
            previewProperties: ["large"]
        }
    },
    additionalColumns: [
        {
            id: "sample_additional",
            title: "Sample additional",
            builder: ({ entity }) => `Generated column: ${entity.values.first_name}`,
            dependencies: ["first_name"]
        }
    ]
});
