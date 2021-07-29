---
id: custom_schema_views
title: Custom schema views
sidebar_label: Custom schema views
---

FireCMS offers default form and table fields for common use cases and also allows
overriding fields if you need a custom implementation, but that might be not
enough in certain cases, where you might want to have a full **custom view related
to one entity**.

In order to accomplish that you can pass an array of `EntityCustomViewBuilder`
to your schema. Like in this example:

```tsx
const sampleView: EntityCustomViewBuilder = {
    path: "preview",
    name: "Blog entry preview",
    builder: ({ schema, entity, modifiedValues }) => (
        // This is a custom component that you can build as any React component
        <MyBlogPreviewComponent entity={entity} modifiedValues={modifiedValues}/>
    )
};

const blogSchema = buildSchema({
    name: "Blog entry",
    views: [
        sampleView
    ],
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        header_image: {
            title: "Header image",
            dataType: "string",
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "images",
                    acceptedFiles: ["image/*"],
                    metadata: {
                        cacheControl: "max-age=1000000"
                    }
                }
            }
        },
        content: {
            title: "Content",
            description: "Example of a complex array with multiple properties as children",
            validation: { required: true },
            dataType: "array",
            columnWidth: 400,
            oneOf: {
                properties: {
                    images: {
                        title: "Images",
                        dataType: "array",
                        of: {
                            dataType: "string",
                            config: {
                                storageMeta: {
                                    mediaType: "image",
                                    storagePath: "images",
                                    acceptedFiles: ["image/*"]
                                }
                            }
                        }
                    },
                    text: {
                        dataType: "string",
                        title: "Text",
                        config: {
                            markdown: true
                        }
                    },
                    products: {
                        title: "Products",
                        dataType: "array",
                        of:{
                            dataType: "reference",
                            collectionPath: "products"
                        }
                    }
                }
            }
        },
    }
})
```
