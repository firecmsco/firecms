import {
    buildEnumValueConfig,
    buildProperty,
    buildSchema,
    getNavigationFrom
} from "@camberi/firecms";
import { locales } from "./products_schema";
import CustomShapedArrayField
    from "../custom_shaped_array/CustomShapedArrayField";
import CustomShapedArrayPreview
    from "../custom_shaped_array/CustomShapedArrayPreview";

const relaxedStatus = new Map([
    ["-3", buildEnumValueConfig({
        label: "Very tense",
        color: "redDarker"
    })],
    ["-2", buildEnumValueConfig({
        label: "Medium tense",
        color: "redLight"
    })],
    ["-1", buildEnumValueConfig({
        label: "Lightly tense",
        color: "redLighter"
    })],
    ["0", buildEnumValueConfig({
        label: "Normal",
        color: "grayLight"
    })],
    ["1", buildEnumValueConfig({
        label: "Lightly relaxed",
        color: "blueLighter"
    })],
    ["2", buildEnumValueConfig({
        label: "Medium relaxed",
        color: "blueLight"
    })],
    ["3", buildEnumValueConfig({
        label: "Very relaxed",
        color: "blueDarker"
    })]
]);

export const testEntitySchema = buildSchema({
    customId: true,
    name: "Test entity",
    onPreSave: ({
                    schema,
                    collectionPath,
                    id,
                    values,
                    status,
                    context
                }) => {
        console.log("custom onPreSave", collectionPath, id);

        getNavigationFrom({
            path: `${collectionPath}/${id}`,
            context
        }).then((result) => console.log("getNavigationFrom", result));

        if (!values.empty_string) values.empty_string = "";

        return values;
    },
    properties: {
        empty_string: {
            title: "Empty String",
            dataType: "string",
            validation: {
                unique: true
            }
        },
        shaped_array: {
            title: "My shaped array",
            dataType: "array",
            config: {
                field: CustomShapedArrayField,
                preview: CustomShapedArrayPreview,
                customProps: {
                    properties: [
                        buildProperty({
                            dataType: "string",
                            title: "Name"
                        }),
                        buildProperty({
                            dataType: "number",
                            title: "Age"
                        })
                    ]
                }
            }
        },
        imageUrls: {
            title: "Images",
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    storageMeta: {
                        mediaType: "image",
                        storagePath: (context) => {
                            return "images";
                        },
                        acceptedFiles: ["image/*"],
                        fileName: (context) => {
                            return context.file.name;
                        }
                    }
                }
            }
        },
        status: {
            title: "Status",
            dataType: "number",
            config: {
                enumValues: relaxedStatus
            }
        },
        available_locales: {
            title: "Available locales",
            dataType: "array",
            of: {
                dataType: "string",
                config: {
                    enumValues: locales
                }
            }
        },
        title: ({ values, entityId }) => {
            if (values?.available_locales && Array.isArray(values.available_locales) && values.available_locales.includes("de"))
                return ({
                    dataType: "string",
                    title: "Title disabled",
                    disabled: {
                        clearOnDisabled: true,
                        tooltip: "Disabled because German is selected"
                    }
                });
            return ({
                dataType: "string",
                title: "Title"
            });
        },
        tags: {
            title: "Tags",
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        product: {
            title: "Product",
            dataType: "reference",
            collectionPath: "products",
            previewProperties: ["name", "main_image"]
        },
        available_dates: {
            dataType: "array",
            title: "Available Dates",
            of: {
                dataType: "timestamp"
            }
        },
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
        image: {
            title: "Image",
            dataType: "string",
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "test",
                    acceptedFiles: ["image/*"]
                }
            }
        },
        mark: {
            title: "Mark",
            dataType: "string",
            config: {
                markdown: true
            }
        },
        test_date: {
            title: "Test date",
            dataType: "timestamp"
        },
        created_at: {
            title: "Created at",
            dataType: "timestamp",
            autoValue: "on_create"
        },
        updated_on: {
            title: "Updated on",
            dataType: "timestamp",
            autoValue: "on_update"
        },
        description: {
            title: "Description",
            dataType: "string",
            config: {
                multiline: true
            }
        },
        search_adjacent: {
            title: "Search adjacent",
            dataType: "boolean"
        },
        difficulty: {
            title: "Difficulty",
            dataType: "number"
        },
        range: {
            title: "Range",
            validation: {
                min: 0,
                max: 3
            },
            dataType: "number"
        },
        pdf: {
            title: "Pdf",
            dataType: "string",
            config: {
                storageMeta: {
                    storagePath: "test"
                }
            }
        }
    },
    defaultValues: {
        // empty_string: "",
        title: null
    }
});



