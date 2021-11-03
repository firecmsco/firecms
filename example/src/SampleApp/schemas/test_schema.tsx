import {
    buildEnumValueConfig,
    buildProperties,
    buildProperty,
    buildSchema,
    EntityCallbacks,
    resolveNavigationFrom
} from "@camberi/firecms";
import { locales } from "./products_schema";
import CustomShapedArrayField
    from "../custom_shaped_array/CustomShapedArrayField";
import CustomShapedArrayPreview
    from "../custom_shaped_array/CustomShapedArrayPreview";
import { CustomField } from "../custom_field/SubPropertyField";

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
    properties: {
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
                        hidden: true,
                        clearOnDisabled: true,
                        tooltip: "Disabled because German is selected"
                    }
                });
            return ({
                dataType: "string",
                title: "Title"
            });
        },
        number_enum: {
            dataType: "array",
            title: "Licences",
            validation: { required: true },
            of: {
                dataType: "number",
                config: {
                    enumValues: {
                        0: "start",
                        1: "standard",
                        2: "premium"
                    }
                }
            }
        },
        simple_enum: {
            dataType: "string",
            title: "Simple enum",
            config: {
                enumValues: {
                    "facebook": "FacebookId",
                    "apple": "Apple"
                }
            }
        },
        validated_custom: {
            dataType: "map",
            title: "Validated custom field",
            properties: {
                sample: {
                    title: "Sample",
                    dataType: "string",
                    validation: {
                        required: true
                    }
                }
            },
            config: {
                Field: CustomField
            }
        },
        source: ({ values }) => {

            const properties = buildProperties<any>({
                type: {
                    dataType: "string",
                    config: {
                        enumValues: {
                            "facebook": "FacebookId",
                            "apple": "Apple"
                        },
                    }
                },
                hidden_field: {
                    title: "Hidden",
                    dataType: "string",
                    disabled: {
                        hidden: false
                    }
                }
            });

            if (values.source) {
                if ((values.source as any).type === "facebook") {
                    properties["facebookId"] = buildProperty({
                        dataType: "string"
                    });
                } else if ((values.source as any).type === "apple") {
                    properties["appleId"] = buildProperty({
                        dataType: "number"
                    });
                }
            }

            return ({
                dataType: "map",
                title: "Source",
                properties: properties
            });
        },
        test_date: {
            title: "Test date",
            dataType: "timestamp"
        },
        content: {
            title: "Content",
            description: "Example of a complex array with multiple properties as children",
            dataType: "array",
            columnWidth: 450,
            oneOf: {
                typeField: "type",
                valueField: "value",
                properties: {
                    title: {
                        title: "Title",
                        dataType: "string"
                    },
                    text: {
                        dataType: "string",
                        title: "Text",
                        config: {
                            markdown: true
                        }
                    },
                    products: {
                        dataType: "array",
                        title: "Product",
                        of: {
                            dataType: "reference",
                            path: "products"
                        }
                    }
                }
            }
        },
        string_array: {
            title: "String array",
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        required_string: {
            title: "Required String",
            dataType: "string",
            validation: {
                required: true
            }
        },
        empty_string: {
            title: "Empty String",
            dataType: "string",
            validation: {
                required: true,
                unique: true
            }
        },
        product: {
            title: "Product",
            dataType: "reference",
            path: "products",
            previewProperties: ["name", "main_image"]
        },
        disabled_product: {
            title: "Disabled product",
            dataType: "reference",
            path: "products",
            disabled: true,
            previewProperties: ["name", "main_image"]
        },
        products: {
            title: "Products",
            dataType: "array",
            of: {
                dataType: "reference",
                path: "products",
                previewProperties: ["name", "main_image"]
            }
        },
        mark: {
            title: "Mark",
            dataType: "string",
            config: {
                markdown: true
            }
        },
        shaped_array: {
            title: "My shaped array",
            dataType: "array",
            config: {
                Field: CustomShapedArrayField,
                Preview: CustomShapedArrayPreview,
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
        actions: {
            title: "Actions",
            description: "Possible user actions",
            dataType: "array",
            of: {
                dataType: "map",
                properties: {
                    name: {
                        title: "Name",
                        description: "Text that will be shown on the button",
                        validation: { required: true },
                        dataType: "string"
                    },
                    type: {
                        title: "Type",
                        description: "Action type that determines the user flow",
                        validation: { required: true, uniqueInArray: true },
                        dataType: "string",
                        config: {
                            enumValues: {
                                complete: "Complete",
                                continue: "Continue"
                            }
                        }
                    },
                    hidden_field: {
                        title: "Hidden",
                        dataType: "string",
                        disabled: {
                            hidden: true
                        }
                    }
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
        tags: {
            title: "Tags",
            dataType: "array",
            of: {
                dataType: "string"
            }
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

export const testCallbacks: EntityCallbacks = {

    onPreSave: ({
                    schema,
                    path,
                    entityId,
                    values,
                    status,
                    context
                }) => {
        return resolveNavigationFrom({
            path: `${path}/${entityId}`,
            context
        }).then((navigationEntries) => {
            console.log("navigationEntries", navigationEntries);
            return values;
        });
    }
};

