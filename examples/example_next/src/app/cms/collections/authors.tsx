import { buildCollection } from "@firecms/core";

export const authorsCollection = buildCollection({
    id: "authors",
    path: "authors",
    name: "Authors",
    singularName: "Author",
    icon: "person_outline",
    textSearchEnabled: true,
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            validation: { required: true }
        },
        email: {
            dataType: "string",
            name: "Email",
            validation: { required: true }
        },
        image: {
            dataType: "string",
            name: "Image",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
                metadata: {
                    contentType: "image/*"
                }
            }
        },
        bio: {
            dataType: "string",
            name: "Bio",
            validation: { required: true }
        },
    }
});
