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
            name: 'Map',
            dataType: 'map',
            properties: {
                child: {
                    name: "Products",
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
            name: "Product",
            dataType: "reference",
            path: "products",
            previewProperties: ["name", "main_image"]
        },
        test_date: {
            name: "Test date",
            dataType: "date"
        },
        movement: buildPropertyBuilder(({values}) => {
            return {
                name: "Locale",
                dataType: "reference",
                // @ts-ignore
                path:  !values.product ? false : values.product.path + "/" + values.product.id + "/locales"
            };
        }),
        name: {
            name: "Name starts with number",
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
                        name: "Facebook id",
                        dataType: "string"
                    });
                } else if ((values.source as any).type === "apple") {
                    properties["appleId"] = buildProperty({
                        name: "Apple id",
                        dataType: "number"
                    });
                }
            }

            return ({
                dataType: "map",
                name: "Source",
                properties: properties
            });
        },
        gallery: {
            name: 'Gallery',
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
            name: "Available locales",
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
                        name: "Title disabled",
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
                name: "Title"
            });
        },
        number_enum: {
            dataType: "array",
            name: "Licences",
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
            name: "Simple enum",
            enumValues: {
                "facebook": "FacebookId",
                "apple": "Apple"
            }
        },
        simple_enum_2: {
            dataType: "string",
            name: "Simple enum 2",
            enumValues: [
                { id: "facebook", label: "FacebookId" },
                { id: "apple", label: "Apple" },
            ]
        },
        validated_custom: {
            dataType: "map",
            name: "Validated custom field",
            properties: {
                sample: {
                    name: "Sample",
                    dataType: "string",
                }
            },
            Field: CustomField
        },
        content: {
            name: "Content",
            description: "Example of a complex array with multiple properties as children",
            dataType: "array",
            columnWidth: 450,
            oneOf: {
                typeField: "type",
                valueField: "value",
                properties: {
                    name: {
                        name: "Title",
                        dataType: "string"
                    },
                    text: {
                        dataType: "string",
                        name: "Text",
                        markdown: true
                    },
                    products: {
                        dataType: "array",
                        name: "Product",
                        of: {
                            dataType: "reference",
                            path: "products"
                        }
                    }
                }
            }
        },
        string_array: {
            name: "String array",
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        empty_string: {
            name: "Empty String",
            dataType: "string",
            validation: {
                unique: true
            }
        },
        disabled_product: {
            name: "Disabled product",
            dataType: "reference",
            path: "products",
            disabled: true,
            previewProperties: ["name", "main_image"]
        },
        products: {
            name: "Products",
            dataType: "array",
            of: {
                dataType: "reference",
                path: "products",
                previewProperties: ["name", "main_image"]
            }
        },
        mark: {
            name: "Mark",
            dataType: "string",
            markdown: true
        },
        shaped_array: {
            name: "My shaped array",
            dataType: "array",
            Field: CustomShapedArrayField,
            Preview: CustomShapedArrayPreview,
            customProps: {
                properties: [
                    buildProperty({
                        dataType: "string",
                        name: "Name"
                    }),
                    buildProperty({
                        dataType: "number",
                        name: "Age"
                    })
                ]
            }
        },
        actions: {
            name: "Actions",
            description: "Possible user actions",
            dataType: "array",
            of: {
                dataType: "map",
                properties: {
                    name: {
                        name: "Name",
                        description: "Text that will be shown on the button",
                        dataType: "string"
                    },
                    description: {
                        name: "Description",
                        dataType: "string"
                    },
                    type: {
                        name: "Type",
                        description: "Action type that determines the user flow",
                        validation: {  uniqueInArray: true },
                        dataType: "string",
                        enumValues: {
                            complete: "Complete",
                            continue: "Continue"
                        }
                    },
                    hidden_field: {
                        name: "Hidden",
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
            name: "Images",
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
            name: "Status",
            dataType: "number",
            enumValues: relaxedStatus
        },
        tags: {
            name: "Tags",
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        available_dates: {
            dataType: "array",
            name: "Available Dates",
            of: {
                dataType: "date"
            }
        },
        images: {
            name: "Images",
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
            name: "Image",
            dataType: "string",
            storage: {
                storagePath: "test",
                acceptedFiles: ["image/*"]
            }
        },
        created_at: {
            name: "Created at",
            dataType: "date",
            autoValue: "on_create"
        },
        updated_on: {
            name: "Updated on",
            dataType: "date",
            autoValue: "on_update"
        },
        description: {
            name: "Description",
            dataType: "string",
            multiline: true
        },
        search_adjacent: {
            name: "Search adjacent",
            dataType: "boolean"
        },
        difficulty: {
            name: "Difficulty",
            dataType: "number"
        },
        range: {
            name: "Range",
            validation: {
                min: 0,
                max: 3
            },
            dataType: "number"
        },
        pdf: buildProperty({
            name: "Pdf",
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
            name: "Full Name",
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
