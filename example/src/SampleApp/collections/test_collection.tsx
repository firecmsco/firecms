import {
    buildCollection,
    buildProperties,
    buildProperty,
    EntityCallbacks,
    EntityIdUpdateProps,
    EntityOnFetchProps, EntityReference,
    EnumValues,
    Properties,
    resolveNavigationFrom,
    toSnakeCase
} from "firecms";
import { CustomField } from "../custom_field/SubPropertyField";
import { usersCollection } from "./users_collection";

const relaxedStatus: EnumValues = [
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
    }
];

export const testCallbacks: EntityCallbacks = {
    onFetch({
                collection,
                context,
                entity,
                path
            }: EntityOnFetchProps) {
        const values = entity.values;
        // values.name = "Forced name";
        return entity;
    },
    onIdUpdate({
                   collection,
                   context,
                   entityId,
                   path,
                   values
               }: EntityIdUpdateProps): string {
        return toSnakeCase(values?.name)
    },

    onPreSave: ({
                    collection,
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

const validatedCustom = buildProperty({
    dataType: "map",
    name: "Validated custom field",
    properties: {
        sample: {
            name: "Sample",
            dataType: "string"
        }
    },
    Field: CustomField
});

export const translationProperties: Properties<any> = {
    en: {
        dataType: "string",
        name: "English"
    },
    es: {
        dataType: "string",
        name: "Español"
    },
    eu: {
        dataType: "string",
        name: "Vasco"
    }
};
const questionProperties = buildProperties({
    id: {
        dataType: "string",
        name: "ID"
    },
    text: {
        dataType: "map",
        name: "Text",
        properties: translationProperties
    },
    question_type: {
        dataType: "string",
        name: "Question type",
        enumValues: {
            multiple_choice: "Multiple choice",
            single_choice: "Single choice"
        }
    }
});

const answersProperties = buildProperties({
    answers: {
        dataType: "array",
        name: "Answers",
        of: {
            dataType: "map",
            name: "Flow",
            properties: {
                id: {
                    dataType: "string",
                    name: "ID"
                },
                text: {
                    dataType: "map",
                    name: "Text",
                    properties: translationProperties
                }
            }
        }
    }
});

export const formPropertyEntry = buildProperty(({ propertyValue }) => {

    const questionMode = propertyValue?.type === "question";
    const additionalProperties = questionMode ? questionProperties : {};
    const questionType = propertyValue?.question_type;
    const questionAdditionalProperties = questionMode && (questionType === "multiple_choice" || questionType === "single_choice") ? answersProperties : {};

    const name = propertyValue?.text?.en ?? "Form entry";
    return {
        dataType: "map",
        name,
        expanded: false,
        properties: {
            type: {
                dataType: "string",
                enumValues: {
                    question: "Question",
                    category: "Category"
                }
            },
            ...additionalProperties,
            ...questionAdditionalProperties
        }
    };
});

export const testCollection = buildCollection({
    callbacks: testCallbacks,
    path: "test_entity",
    customId: false,
    name: "Test entities",
    properties: {

        // specSheet: ({
        //                 values,
        //                 entityId
        //             }) => ({
        //     name: "Specs sheet",
        //     dataType: "array",
        //     of: {
        //         dataType: "string",
        //         storage: {
        //             mediaType: "image",
        //             storagePath: "products/" + entityId + "/pdf",
        //             acceptedFiles: ["application/pdf"],
        //             metadata: {
        //                 cacheControl: "max-age=1000000"
        //             }
        //         }
        //     }
        // }),

        test_string: {
            dataType: "string",
            name: "Test string"
        },
        test_custom: {
            dataType: "string",
            name: "Test custom",
            fieldConfig: "test_custom_field"
        },
        // map: {
        //     dataType: "map",
        //     properties: {
        //         sample: {
        //             name: "Sample",
        //             dataType: "string",
        //             validation: {
        //                 required: true
        //             }
        //         },
        //         num: {
        //             name: "Num",
        //             dataType: "number",
        //             validation: {
        //                 required: true,
        //                 min: 5
        //             }
        //         }
        //     }
        // },
        // test_enum: buildProperty({
        //     dataType: "string",
        //     name: "Currency",
        //     enumValues: [
        //         {
        //             id: "EUR",
        //             label: "Euros",
        //             color: "blueDark"
        //         },
        //         {
        //             id: "DOL",
        //             label: "Dollars",
        //             color: {
        //                 color: "#FFFFFF",
        //                 text: "#333333"
        //             }
        //         }
        //     ]
        // }),
        // background: {
        //     dataType: "number", // NB – this was string” above..
        //     name: "Colour",
        //     enumValues:
        //         [
        //             {
        //                 id: 4281080974,
        //                 label: " Blue ",
        //                 color: "blueDarker"
        //             },
        //             {
        //                 id: 4293947270,
        //                 label: " Cyan ",
        //                 color: "cyanDarker"
        //             }
        //         ]
        // },
        //
        // test_date: {
        //     name: "Test date",
        //     dataType: "date",
        //     mode: "date"
        // },
        // name: {
        //     dataType: "string",
        //     name: "Name"
        // },
        // self_ref: {
        //     name: "Self ref",
        //     dataType: "reference",
        //     path: "test_entity"
        // },
        // self_refs: {
        //     dataType: "array",
        //     of: {
        //         dataType: "reference",
        //         name: "Self refs",
        //         path: "test_entity"
        //         // previewProperties: ["name","url_image"]
        //     }
        // },
        // url_image: {
        //     dataType: "string",
        //     name: "URL image",
        //     storage: {
        //         storagePath: "images",
        //         acceptedFiles: ["image/*"],
        //         storeUrl: true,
        //         fileName: async ({ file }) => {
        //             await new Promise(resolve => setTimeout(resolve, 100));
        //             return file.name;
        //         },
        //         metadata: {
        //             cacheControl: "max-age=1000000"
        //         }
        //     }
        // },
        // myArray: {
        //     name: "some array",
        //     dataType: "array",
        //     of: {
        //         dataType: "map",
        //         properties: {
        //             prop1: {
        //                 dataType: "string",
        //                 name: "prop1"
        //             },
        //             prop2: {
        //                 dataType: "number",
        //                 name: "prop2"
        //             }
        //         },
        //         defaultValue: {
        //             // this DOESN'T works as initial value :(
        //             prop1: "hello 2",
        //             prop2: 2
        //         }
        //     },
        //     defaultValue: [
        //         // this works as initial value :)
        //         {
        //             prop1: "hello 1",
        //             prop2: 1
        //         }
        //     ]
        // },

        // impacts: {
        //     name: "Impacts",
        //     validation: { required: true },
        //     dataType: "array",
        //     of: buildProperty({
        //         dataType: "map",
        //         properties: {
        //             name: {
        //                 name: "Name",
        //                 validation: { required: true },
        //                 dataType: "string"
        //             },
        //             point1: {
        //                 name: "Point-1",
        //                 validation: { required: true },
        //                 dataType: "number"
        //             },
        //             point2: {
        //                 name: "Point-2",
        //                 validation: { required: true },
        //                 dataType: "number"
        //             }
        //         }
        //     })
        // },
        product: {
            name: "Product",
            dataType: "reference",
            path: "products",
            defaultValue: new EntityReference("B000P0MDMS", "products")
        }
        // movement: buildProperty(({ values }) => {
        //     return {
        //         name: "Locale",
        //         dataType: "reference",
        //         path: !values.product ? false : values.product.path + "/" + values.product.id + "/locales"
        //     };
        // }),
        // form: {
        //     dataType: "array",
        //     name: "Form",
        //     of: formPropertyEntry
        // },
        // child_ref: {
        //     name: "Child reference",
        //     dataType: "reference",
        //     path: "ppp/B000P0MDMS/locales"
        // },
        // address: buildProperty({
        //     name: "Address",
        //     dataType: "map",
        //     properties: {
        //         street: {
        //             name: "Street",
        //             dataType: "string"
        //         },
        //         postal_code: {
        //             name: "Postal code",
        //             dataType: "number"
        //         }
        //     },
        //     spreadChildren: true,
        //     expanded: true
        // }),
        // name_number: {
        //     name: "Name starts with number",
        //     dataType: "string",
        //     validation:{
        //         // required: true,
        //         matches: /\d.*/,
        //         matchesMessage: "Must start with a number"
        //     }
        // },
        // shaped_array: {
        //     dataType: "array",
        //     of: [
        //         {
        //             dataType: "string",
        //             name: "Name"
        //         },
        //         {
        //             dataType: "number",
        //             name: "age"
        //         },
        //     ]
        // },
        // function_array: {
        //     dataType: "array",
        //     name: "Function array",
        //     of: ({ propertyValue, index }) => {
        //         return ({
        //             dataType: "string",
        //             name: "Name"
        //         });
        //     }
        // },
        // map_array_ref: {
        //     name: 'Map',
        //     dataType: 'map',
        //     expanded: false,
        //     properties: {
        //         child: {
        //             name: "Products",
        //             dataType: 'array',
        //             of: {
        //                 dataType: "reference",
        //                 path: "products",
        //                 previewProperties: ["name", "main_image"]
        //             },
        //         }
        //     },
        // },
        // source: ({ values, previousValues }) => {
        //     const properties = buildProperties<any>({
        //         type: {
        //             dataType: "string",
        //             enumValues: {
        //                 "facebook": "FacebookId",
        //                 "apple": "Apple"
        //             }
        //         }
        //     });
        //
        //     if (values.source) {
        //         if ((values.source as any).type === "facebook") {
        //             properties["facebookId"] = buildProperty({
        //                 name: "Facebook id",
        //                 dataType: "string"
        //             });
        //         } else if ((values.source as any).type === "apple") {
        //             properties["appleId"] = buildProperty({
        //                 name: "Apple id",
        //                 dataType: "number"
        //             });
        //         }
        //     }
        //
        //     return ({
        //         dataType: "map",
        //         name: "Source",
        //         properties: properties
        //     });
        // },
        // gallery: {
        //     name: 'Gallery',
        //     dataType: 'array',
        //     of: {
        //         dataType: 'string',
        //         storage: {
        //             storagePath: 'images',
        //             acceptedFiles: ['image/*'],
        //             metadata: {
        //                 cacheControl: 'max-age=1000000',
        //             },
        //         },
        //     },
        // },
        // available_locales: {
        //     name: "Available locales",
        //     dataType: "array",
        //     of: {
        //         dataType: "string",
        //         enumValues: locales
        //     }
        // },
        // title: ({ values, entityId }) => {
        //     if (values?.available_locales && Array.isArray(values.available_locales)) {
        //         if (values.available_locales.includes("de"))
        //             return ({
        //                 dataType: "string",
        //                 name: "Title disabled",
        //                 disabled: {
        //                     hidden: true,
        //                     clearOnDisabled: true,
        //                     tooltip: "Disabled because German is selected"
        //                 }
        //             });
        //         if (values.available_locales.includes("it"))
        //             return null;
        //     }
        //     return ({
        //         dataType: "string",
        //         name: "Title"
        //     });
        // },
        // number_enum: {
        //     dataType: "array",
        //     name: "Licences",
        //     of: {
        //         dataType: "number",
        //         enumValues: {
        //             0: "start",
        //             1: "standard",
        //             2: "premium"
        //         }
        //     }
        // },
        // simple_enum: {
        //     dataType: "string",
        //     name: "Simple enum",
        //     enumValues: {
        //         "facebook": "FacebookId",
        //         "apple": "Apple"
        //     }
        // },
        // simple_enum_2: {
        //     dataType: "string",
        //     name: "Simple enum 2",
        //     enumValues: [
        //         { id: "facebook", label: "FacebookId" },
        //         { id: "apple", label: "Apple" },
        //     ]
        // },
        // validated_custom: validatedCustom,
        // content: {
        //     name: "Content",
        //     description: "Example of a complex array with multiple properties as children",
        //     dataType: "array",
        //     columnWidth: 450,
        //     oneOf: {
        //         typeField: "type",
        //         valueField: "value",
        //         properties: {
        //             name: {
        //                 name: "Title",
        //                 dataType: "string"
        //             },
        //             text: {
        //                 dataType: "string",
        //                 name: "Text",
        //                 markdown: true
        //             },
        //             products: {
        //                 dataType: "array",
        //                 name: "Product",
        //                 of: {
        //                     dataType: "reference",
        //                     path: "products"
        //                 }
        //             }
        //         }
        //     }
        // },
        // string_array: {
        //     name: "String array",
        //     dataType: "array",
        //     of: {
        //         dataType: "string"
        //     }
        // },
        // empty_string: {
        //     name: "Empty String",
        //     dataType: "string",
        //     validation: {
        //         unique: true
        //     }
        // },
        // disabled_product: {
        //     name: "Disabled product",
        //     dataType: "reference",
        //     path: "products",
        //     disabled: true,
        //     previewProperties: ["name", "main_image"]
        // },
        // products: {
        //     name: "Products",
        //     dataType: "array",
        //     of: {
        //         dataType: "reference",
        //         path: "products",
        //         previewProperties: ["name", "main_image"]
        //     }
        // },
        // mark: {
        //     name: "Mark",
        //     dataType: "string",
        //     markdown: true
        // },
        // custom_shaped_array: {
        //     name: "My shaped array",
        //     dataType: "array",
        //     Field: CustomShapedArrayField,
        //     Preview: CustomShapedArrayPreview,
        //     customProps: {
        //         properties: [
        //             buildProperty({
        //                 dataType: "string",
        //                 name: "Name"
        //             }),
        //             buildProperty({
        //                 dataType: "number",
        //                 name: "Age"
        //             })
        //         ]
        //     }
        // },
        // actions: {
        //     name: "Actions",
        //     description: "Possible user actions",
        //     dataType: "array",
        //     of: {
        //         dataType: "map",
        //         properties: {
        //             name: {
        //                 name: "Name",
        //                 description: "Text that will be shown on the button",
        //                 dataType: "string"
        //             },
        //             description: {
        //                 name: "Description",
        //                 dataType: "string"
        //             },
        //             type: {
        //                 name: "Type",
        //                 description: "Action type that determines the user flow",
        //                 validation: {  uniqueInArray: true },
        //                 dataType: "string",
        //                 enumValues: {
        //                     complete: "Complete",
        //                     continue: "Continue"
        //                 }
        //             },
        //             hidden_field: {
        //                 name: "Hidden",
        //                 dataType: "string",
        //                 disabled: {
        //                     hidden: true
        //                 }
        //             }
        //         },
        //         pickOnlySomeKeys: true
        //     }
        // },
        // imageUrls: {
        //     name: "Images",
        //     dataType: "array",
        //     of: {
        //         dataType: "string",
        //         storage: {
        //             storagePath: (context) => {
        //                 return "images";
        //             },
        //             acceptedFiles: ["image/*"],
        //             fileName: (context) => {
        //                 return context.file.name;
        //             }
        //         }
        //     }
        // },
        // status: {
        //     name: "Status",
        //     dataType: "number",
        //     enumValues: relaxedStatus
        // },
        // tags: {
        //     name: "Tags",
        //     dataType: "array",
        //     of: {
        //         dataType: "string"
        //     }
        // },
        // available_dates: {
        //     dataType: "array",
        //     name: "Available Dates",
        //     of: {
        //         dataType: "date"
        //     }
        // },
        // images: {
        //     name: "Images",
        //     dataType: "array",
        //     of: {
        //         dataType: "string",
        //         storage: {
        //             storagePath: "images",
        //             acceptedFiles: ["image/*"]
        //         }
        //     }
        // },
        // image: {
        //     name: "Image",
        //     dataType: "string",
        //     storage: {
        //         storagePath: "test",
        //         acceptedFiles: ["image/*"]
        //     }
        // },
        // created_on: {
        //     name: "Created on",
        //     dataType: "date",
        //     autoValue: "on_create"
        // },
        // updated_on: {
        //     name: "Updated on",
        //     dataType: "date",
        //     autoValue: "on_update"
        // }
        // description: {
        //     name: "Description",
        //     dataType: "string",
        //     multiline: true
        // },
        // search_adjacent: {
        //     name: "Search adjacent",
        //     dataType: "boolean"
        // },
        // difficulty: {
        //     name: "Difficulty",
        //     dataType: "number"
        // },
        // range: {
        //     name: "Range",
        //     validation: {
        //         min: 0,
        //         max: 3
        //     },
        //     dataType: "number"
        // },
        // read_only: {
        //     dataType: "string",
        //     name: "Read only",
        //     readOnly: true
        // },
        // pdf: buildProperty({
        //     name: "Pdf",
        //     dataType: "string",
        //     storage: {
        //         storagePath: "test",
        //         acceptedFiles: ['application/pdf'],
        //     }
        // }),
    },
    additionalFields: [
        {
            id: "full_name",
            name: "Full Name",
            Builder: ({ entity }) => {
                const values = entity.values;
                return typeof values.name === "string" ? values.name.toUpperCase() : "Nope";
            },
            dependencies: ["name"]
        }
    ],
    subcollections: [
        usersCollection
    ]
});
