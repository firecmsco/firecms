import {
    buildProperties,
    buildProperty,
    buildPropertyBuilder,
    buildSchema,
    EntityCallbacks,
    EnumValues,
    resolveNavigationFrom
} from "@camberi/firecms";
import CustomShapedArrayField
    from "../custom_shaped_array/CustomShapedArrayField";
import CustomShapedArrayPreview
    from "../custom_shaped_array/CustomShapedArrayPreview";
import { CustomField } from "../custom_field/SubPropertyField";
import { locales } from "./enums";

const relaxedStatus:EnumValues = [
    {
        id: "-3",
        label: "Very tense",
        color: "redDarker"
    },
    {
        id: "-2",
        label: "Medium tense",
        color: "redLight"
    },
    {
        id: "-1",
        label: "Lightly tense",
        color: "redLighter"
    },
    {
        id: "0",
        label: "Normal",
        color: "grayLight"
    },
    {
        id: "1",
        label: "Lightly relaxed",
        color: "blueLighter"
    },
    {
        id: "2",
        label: "Medium relaxed",
        color: "blueLight"
    },
    {
        id: "3",
        label: "Very relaxed",
        color: "blueDarker"
    }
];

export const testEntitySchema = buildSchema({
    id: "test",
    customId: false,
    name: "Test entity",
    properties: {
        map_array_ref: {
            title: 'Map',
            dataType: 'map',
            properties: {
                child: {
                    title: "Products",
                    dataType: 'array',
                    of: {
                        dataType: "reference",
                        path: "products",
                        previewProperties: ["name", "main_image"]
                    },
                }
            },
        },
        product: {
            title: "Product",
            dataType: "reference",
            path: "products",
            previewProperties: ["name", "main_image"]
        },
        test_date: {
            title: "Test date",
            dataType: "timestamp"
        },
        movement: buildPropertyBuilder(({values}) => {
            return {
                title: "Locale",
                dataType: "reference",
                // @ts-ignore
                path:  !values.product ? false : values.product.path + "/" + values.product.id + "/locales"
            };
        }),
        name: {
            title: "Name starts with number",
            dataType: "string",
            validation:{
                matches: /\d.*/,
                matchesMessage: "Must start with a number"
            }
        },
        source: ({ values, previousValues }) => {
            const properties = buildProperties<any>({
                type: {
                    dataType: "string",
                    enumValues: {
                        "facebook": "FacebookId",
                        "apple": "Apple"
                    }
                }
            });

            if (values.source) {
                if ((values.source as any).type === "facebook") {
                    properties["facebookId"] = buildProperty({
                        title: "Facebook id",
                        dataType: "string"
                    });
                } else if ((values.source as any).type === "apple") {
                    properties["appleId"] = buildProperty({
                        title: "Apple id",
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
        gallery: {
            title: 'Gallery',
            dataType: 'array',
            of: {
                dataType: 'string',
                storage: {
                    storagePath: 'images',
                    acceptedFiles: ['image/*'],
                    metadata: {
                        cacheControl: 'max-age=1000000',
                    },
                },
            },
        },
        available_locales: {
            title: "Available locales",
            dataType: "array",
            of: {
                dataType: "string",
                enumValues: locales
            }
        },
        title: ({ values, entityId }) => {
            if (values?.available_locales && Array.isArray(values.available_locales)) {
                if (values.available_locales.includes("de"))
                    return ({
                        dataType: "string",
                        title: "Title disabled",
                        disabled: {
                            hidden: true,
                            clearOnDisabled: true,
                            tooltip: "Disabled because German is selected"
                        }
                    });
                if (values.available_locales.includes("it"))
                    return null;
            }
            return ({
                dataType: "string",
                title: "Title"
            });
        },
        number_enum: {
            dataType: "array",
            title: "Licences",
            of: {
                dataType: "number",
                enumValues: {
                    0: "start",
                    1: "standard",
                    2: "premium"
                }
            }
        },
        simple_enum: {
            dataType: "string",
            title: "Simple enum",
            enumValues: {
                "facebook": "FacebookId",
                "apple": "Apple"
            }
        },
        simple_enum_2: {
            dataType: "string",
            title: "Simple enum 2",
            enumValues: [
                { id: "facebook", label: "FacebookId" },
                { id: "apple", label: "Apple" },
            ]
        },
        validated_custom: {
            dataType: "map",
            title: "Validated custom field",
            properties: {
                sample: {
                    title: "Sample",
                    dataType: "string",
                }
            },
            Field: CustomField
        },
        test_date: {
            title: "Test date",
            dataType: "date"
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
                        markdown: true
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
        empty_string: {
            title: "Empty String",
            dataType: "string",
            validation: {
                unique: true
            }
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
            markdown: true
        },
        shaped_array: {
            title: "My shaped array",
            dataType: "array",
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
                        dataType: "string"
                    },
                    description: {
                        title: "Description",
                        dataType: "string"
                    },
                    type: {
                        title: "Type",
                        description: "Action type that determines the user flow",
                        validation: {  uniqueInArray: true },
                        dataType: "string",
                        enumValues: {
                            complete: "Complete",
                            continue: "Continue"
                        }
                    },
                    hidden_field: {
                        title: "Hidden",
                        dataType: "string",
                        disabled: {
                            hidden: true
                        }
                    }
                },
                pickOnlySomeKeys: true
            }
        },
        imageUrls: {
            title: "Images",
            dataType: "array",
            of: {
                dataType: "string",
                storage: {
                    storagePath: (context) => {
                        return "images";
                    },
                    acceptedFiles: ["image/*"],
                    fileName: (context) => {
                        return context.file.name;
                    }
                }
            }
        },
        status: {
            title: "Status",
            dataType: "number",
            enumValues: relaxedStatus
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
                dataType: "date"
            }
        },
        images: {
            title: "Images",
            dataType: "array",
            of: {
                dataType: "string",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            }
        },
        image: {
            title: "Image",
            dataType: "string",
            storage: {
                storagePath: "test",
                acceptedFiles: ["image/*"]
            }
        },
        created_at: {
            title: "Created at",
            dataType: "date",
            autoValue: "on_create"
        },
        updated_on: {
            title: "Updated on",
            dataType: "date",
            autoValue: "on_update"
        },
        description: {
            title: "Description",
            dataType: "string",
            multiline: true
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
        pdf: buildProperty({
            title: "Pdf",
            dataType: "string",
            storage: {
                storagePath: "test",
                acceptedFiles: ['application/pdf'],
            }
        })
    },
    additionalColumns: [
        {
            id: "full_name",
            title: "Full Name",
            builder: ({entity}) => {
                let values = entity.values;
                return typeof values.name === "string" ? values.name.toUpperCase() : "Nope";
            },
            dependencies: ["name"]
        }
    ]
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
