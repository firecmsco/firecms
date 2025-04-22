import { buildCollection } from "@firecms/core";
import { EmailIcon } from "@firecms/ui";

export const usersCollection = buildCollection({
    id: "users",
    path: "users",
    name: "Users",
    singularName: "User",
    description: "Registered users",
    textSearchEnabled: true,
    icon: "Person",
    entityActions: [{
        icon: <EmailIcon/>,
        name: "Send email voucher code",
        onClick: async ({
                            entity,
                            context
                        }) => {
            context.snackbarController.open({
                type: "info",
                message: `Sending email to ${entity.values.email}`,
            })
        }
    },],
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
        related_users: {
            dataType: "array",
            name: "Related users",
            of: {
                dataType: "reference",
                path: "users"
            }
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
            key: "sample_additional",
            name: "Sample additional",
            Builder: ({ entity }) => <div
                className={"text-red-500"}>{`Generated column: ${entity.values.first_name}`}</div>,
            value: async ({ entity }) => `Export value: ${entity.values.first_name}`,
            dependencies: ["first_name"]
        }
    ]
});
