import {
    buildCollection,
    buildProperty,
    EntityCallbacks,
    EntityOnFetchProps,
    FieldProps,
    resolveNavigationFrom,
    TextFieldBinding
} from "@firecms/core";
import { ProductsSecondaryForm } from "../custom_entity_view/ProductsSecondaryForm";
import { Icon, IconButton, Typography } from "@firecms/ui";
import React from "react";
import { PromptConfigSecondaryForm } from "../custom_entity_view/PromptConfigSecondaryForm";
import { locales } from "./enums";

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
    // onIdUpdate({
    //                collection,
    //                context,
    //                entityId,
    //                path,
    //                values
    //            }: EntityIdUpdateProps): string {
    //     return toSnakeCase(values?.name)
    // },

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
            return values;
        });
    }
};

const CustomField = (fieldProps: FieldProps) => {
    return (
        <>
            <TextFieldBinding {...fieldProps} />
            <div className={"flex flex-row items-center gap-2"}>
                <IconButton
                    size={"small"}
                    onClick={() => {
                        fieldProps.setValue(fieldProps.customProps?.slugified);
                    }}
                >
                    <Icon size={"smallest"} iconKey="autorenew"/>
                </IconButton>
                <Typography variant={"caption"}>{fieldProps.customProps?.slugified}</Typography>
            </div>
        </>
    );
};

export const testCollection = buildCollection<any>({
        callbacks: testCallbacks,
        id: "test_entity_id",
        path: "test_entity",
        customId: true,
        name: "Test entities",
        alwaysApplyDefaultValues: true,
        permissions: {
            // edit: false,
            // create: false,
            // delete: false,
            // read: true
        },
        subcollections: [
            {
                id: "sub_collection/with/slash",
                name: "Sub collection with slash",
                path: "path/with/slash",
                properties: {
                    sub_prop: {
                        type: "string",
                        name: "Sub prop",
                    }
                },
                subcollections: [

                    {
                        id: "sub_sub_collection/with/slash",
                        name: "Sub sub collection with slash",
                        path: "sub_sub_path/with/slash",
                        properties: {
                            sub_prop: {
                                type: "string",
                                name: "Sub prop",
                                Field: CustomField,
                            }
                        }
                    }
                ]
            }
        ],
        entityViews: [
            {
                key: "sec",
                name: "Secondary form",
                includeActions: true,
                Builder: ProductsSecondaryForm
            }, {
                key: "prompt",
                name: "Prompt",
                includeActions: true,
                Builder: PromptConfigSecondaryForm
            }
        ],
        // additionalFields: [{
        //     key: "custom",
        //     name: "Custom",
        //     Builder: () => {
        //         return <div>YO</div>
        //     }
        // }],
        properties: {
            basic: {
                type: "string",
                name: "Basic",
                validation: {
                    unique: true,
                }
            },
            basic_number: {
                type: "number",
                name: "Basic number",
                validation: {
                    min: 0,
                    max: 100
                }
            },
            ref_as_string: {
                type: "string",
                name: "Reference as string",
                reference: {
                    type: "reference",
                    path: "products",
                }
            },
            ref: {
                type: "reference",
                name: "Reference",
                path: "products",
            },

            // answers: ({ entityId }) => {
            //     return {
            //         name: "answers",
            //         type: "array",
            //         readOnly: entityId === "paragraph" ? true : false,
            //         validation: {
            //             min: 4,
            //             max: 4,
            //             required: entityId === "paragraph" ? false : true
            //         },
            //         of: {
            //             name: "answer",
            //             type: "map",
            //             properties: {
            //                 isCorrect: {
            //                     name: "isCorrect",
            //                     type: "boolean",
            //                     validation: { required: entityId === "paragraph" ? false : true }
            //                 },
            //                 text: {
            //                     name: "text",
            //                     type: "string",
            //                     validation: { required: entityId === "paragraph" ? false : true }
            //                 }
            //             }
            //         }
            //     }
            // },
            // test_upload: {
            //     type: "array",
            //     name: "Test upload",
            //     of: buildProperty({
            //         type: "string",
            //         columnWidth: 400,
            //         storage: {
            //             storagePath: "/",
            //         },
            //         name: "Media",
            //     })
            // },
            // slug: ({ propertyValue }) => {
            //     const slugified = slugify(propertyValue);
            //     const regExp = new RegExp(slugified);
            //     return {
            //         type: "string",
            //         name: "Slug",
            //         Field: CustomField,
            //         customProps: {
            //             slugified
            //         },
            //         validation: {
            //             required: true,
            //             matches: regExp,
            //             matchesMessage: "Text entered must equal slugified string: " + slugified
            //         }
            //     };
            // },
            multiline: {
                type: "string",
                name: "Multiline",
                multiline: true,
                defaultValue: "Hello\nWorld",
            },
            // date: {
            //     name: "My date",
            //     type: "date",
            //     // disabled: true
            //     autoValue: "on_create"
            // },
            // date_update: {
            //     name: "My date update",
            //     type: "date",
            //     autoValue: "on_update"
            // },
            //
            // test_date: {
            //     name: "Test date",
            //     type: "date",
            //     mode: "date_time",
            //     clearable: true
            // },
            locale: {
                name: "Locales",
                type: "string",
                enumValues: locales,
                clearable: true
            },
            available_locales: {
                name: "Available locales",
                type: "array",
                of: {
                    type: "string",
                    enumValues: locales
                }
            },
            image: {
                type: "string",
                name: "Image",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"],
                    metadata: {
                        cacheControl: "max-age=1000000"
                    }
                },
                // validation: { required: true }
            },
            images: {
                type: "array",
                name: "Images",
                of: {
                    type: "string",
                    storage: {
                        storagePath: "images",
                        acceptedFiles: ["image/*"],
                        metadata: {
                            cacheControl: "max-age=1000000"
                        }
                    }
                }
            },
            // readOnly: {
            //     type: "string",
            //     readOnly: true,
            //     name: "Read only"
            // },
            // contactDetails: {
            //     hideFromCollection: true,
            //     type: "array",
            //     name: "Contact details",
            //     of: {
            //         type: "map",
            //         name: "Contact info",
            //         previewProperties: ["data"],
            //         properties: {
            //             id: {
            //                 type: "string",
            //                 name: "ID (auto)",
            //                 // readOnly: true,
            //                 // Field: () => null,
            //                 defaultValue: crypto.randomUUID(),
            //             },
            //         },
            //     },
            // },
            // type: {
            //     type: "string",
            //     disabled: true,
            //     name: "Type",
            //     enumValues: [
            //         {
            //             id: "seat",
            //             label: "Seat"
            //         },
            //         {
            //             id: "cabin",
            //             label: "Cabin"
            //         }
            //     ]
            // },
            // config: ({ values }) => {
            //     switch (values.type) {
            //         case "seat":
            //             return buildProperty({
            //                 type: "map",
            //                 name: "Seat config",
            //                 properties: {
            //                     category: {
            //                         type: "string",
            //                         name: "Category",
            //                         enumValues: [
            //                             {
            //                                 id: "deck",
            //                                 label: "Deck"
            //                             },
            //                             {
            //                                 id: "lounge",
            //                                 label: "Lounge"
            //                             },
            //                             {
            //                                 id: "numbered",
            //                                 label: "Numbered"
            //                             }
            //                         ]
            //                     }
            //                 }
            //             });
            //         case "cabin":
            //             return buildProperty({
            //                 type: "map",
            //                 name: "Cabin config",
            //                 properties: {
            //                     capacity: {
            //                         type: "number",
            //                         name: "Cabin capacity"
            //                     },
            //                     specialNeeds: {
            //                         type: "boolean",
            //                         name: "Special Needs"
            //                     }
            //                 }
            //             });
            //
            //         default:
            //             return {
            //                 type: "map",
            //                 disabled: true
            //             };
            //     }
            // },
            // isAdmin: {
            //     name: "Admin",
            //     type: "boolean",
            //     defaultValue: false
            // },
            // users: ({ values }) => {
            //     if (values.isAdmin)
            //         return null;
            //     return ({
            //         name: "Clients",
            //         type: "array",
            //         of: { type: "reference", path: "users", previewProperties: ["name"] }
            //     });
            // },

            // rerender: () => ({
            //     type: "map",
            //     hideFromCollection: true,
            //     Field: () => {
            //         console.log("Rerendering");
            //         return <div>Test</div>;
            //     }
            // }),
            body: buildProperty({
                name: "Body",
                validation: { required: false },
                type: "map",
                keyValue: true,
                customProps: {
                    editable: true
                },
                defaultValue: {
                    clientIp: "client.ip",
                    clientDeviceType: "client.deviceType",
                    clientLanguage: "client.language",
                    clientReferral: "client.referral",
                    clientUserAgent: "client.userAgent"
                }
            }),

            size: {
                type: "map",
                minimalistView: true,
                name: "Size",
                properties: {
                    width: {
                        name: "Width",
                        type: "number",
                        validation: {
                            required: true
                        }
                    },
                    height: {
                        name: "Height",
                        type: "number",
                        validation: {
                            required: true
                        }
                    }
                },
                widthPercentage: 50
            },
            // background: {
            //     type: "number",
            //     name: "Colour",
            //     enumValues:
            //         [
            //             {
            //                 id: 0,
            //                 label: " Black ",
            //                 color: "grayDarker"
            //             },
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
            // upload: {
            //     name: "Upload",
            //     type: "string",
            //     storage: {
            //         storagePath: "test",
            //         acceptedFiles: ["application/*"],
            //     }
            // },
            // file: {
            //     name: "File",
            //     description: "The uploaded file of the document.",
            //     hideFromCollection: false,
            //     type: "string",
            //     validation: {
            //         required: false,
            //     },
            //     propertyConfig: "file_upload",
            //     storage: {
            //         storeUrl: true,
            //         storagePath: "/documents",
            //         acceptedFiles: [
            //             "application/",
            //             "text/"
            //         ],
            //     },
            // },
            // mainSaturation: {
            //     name: "Main saturation",
            //     description: "Saturation applied to all colors when there is no saturation on color applied",
            //     type: "array",
            //     of: {
            //         type: "map",
            //         properties: {
            //             type: {
            //                 name: "Type",
            //                 type: "string",
            //                 enumValues: {
            //                     oneNum: "Saturation without range",
            //                     fromTo: "Saturation available range"
            //                 }
            //             },
            //             value: (props) => {
            //                 const { propertyValue } = props;
            //                 // console.log("props", props);
            //                 if (propertyValue?.type === "oneNum") {
            //                     return ({
            //                         name: "Saturation",
            //                         type: "number",
            //                         validation: {
            //                             min: 0,
            //                             max: 100
            //                         }
            //                     })
            //                 } else if (propertyValue?.type === "fromTo") {
            //                     return ({
            //                             name: "Saturation available range",
            //                             type: "map",
            //                             properties: {
            //                                 from: {
            //                                     name: "From",
            //                                     type: "number",
            //                                     validation: {
            //                                         min: 0,
            //                                         max: 100
            //                                     }
            //                                 },
            //                                 to: {
            //                                     name: "To",
            //                                     type: "number",
            //                                     clearable: true,
            //                                     validation: {
            //                                         min: 0,
            //                                         max: 100
            //                                     }
            //                                 }
            //                             }
            //                         }
            //                     )
            //                 } else {
            //                     return {
            //                         type: "string",
            //                         name: "Type",
            //                         disabled: { hidden: true }
            //                     };
            //                 }
            //             }
            //         }
            //     }
            // },
            // map: {
            //     name: "Map",
            //     type: "map",
            //     properties: {
            //         nested_1: {
            //             name: "Nested 1",
            //             type: "map",
            //             properties: {
            //                 nested_2: {
            //                     name: "Nested 2",
            //                     type: "map",
            //                     properties: {
            //                         nested_3: {
            //                             name: "Nested 3",
            //                             type: "map",
            //                             properties: {
            //                                 name: {
            //                                     name: "Name",
            //                                     type: "string"
            //                                 },
            //                                 num: {
            //                                     name: "Num",
            //                                     type: "number"
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // },
            // array_enum: {
            //     name: "Array enum",
            //     type: "array",
            //     of: {
            //         name: "My enum",
            //         type: "string",
            //         enumValues: {
            //             value1: "My Value 1",
            //             value2: "Your Value 2",
            //             value3: "Another Value 3",
            //             value4: "Another Value 4",
            //             value5: "Another Value 5",
            //             value6: "Another Value 6",
            //             value7: "Another Value 7",
            //             value8: "Another Value 8",
            //             value9: "Another Value 9",
            //             value10: "Another Value 10",
            //             value11: "Another Value 11",
            //             value12: "Another Value 12",
            //             value13: "Another Value 13",
            //             value14: "Another Value 14"
            //
            //         },
            //         validation: { required: false },
            //         clearable: true
            //     }
            // },
            // enum: {
            //     name: "My enum",
            //     type: "string",
            //     enumValues: {
            //         value1: "My Value 1",
            //         value2: "Your Value 2",
            //         value3: "Another Value 3",
            //         value4: "Another Value 4",
            //         value5: "Another Value 5",
            //         value6: "Another Value 6",
            //         value7: "Another Value 7",
            //         value8: "Another Value 8",
            //         value9: "Another Value 9",
            //         value10: "Another Value 10",
            //         value11: "Another Value 11",
            //         value12: "Another Value 12",
            //         value13: "Another Value 13",
            //         value14: "Another Value 14"
            //     },
            //     validation: { required: false },
            //     clearable: true
            // },
            tags: {
                name: "Tags",
                type: "array",
                // sortable: false,
                // canAddElements: false,
                of: {
                    type: "string"
                }
            },
            // specSheet: ({
            //                 values,
            //                 entityId
            //             }) => ({
            //     name: "Specs sheet",
            //     type: "array",
            //     of: {
            //         type: "string",
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
            //
            // name: {
            //     type: "string",
            //     name: "Name"
            // },
            // key_value: {
            //     type: "map",
            //     name: "Key value",
            //     keyValue: true
            // },
            // test_string: {
            //     type: "string",
            //     name: "Test string",
            //     disabled: { hidden: true },
            //     validation: {
            //         required: true
            //     }
            // },
            // test_custom: {
            //     type: "string",
            //     name: "Test custom",
            //     propertyConfig: "test_custom_field"
            // },
            // map: {
            //     type: "map",
            //     properties: {
            //         sample: {
            //             name: "Sample",
            //             type: "string",
            //             validation: {
            //                 required: true
            //             }
            //         },
            //         num: {
            //             name: "Num",
            //             type: "number",
            //             validation: {
            //                 required: true,
            //                 min: 5
            //             }
            //         }
            //     }
            // },
            // test_enum: buildProperty({
            //     type: "string",
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
            // self_ref: {
            //     name: "Self ref",
            //     type: "reference",
            //     path: "test_entity"
            // },
            self_refs: {
                type: "array",
                name: "Self references",
                of: {
                    type: "reference",
                    name: "Self refs",
                    path: "test_entity"
                    // previewProperties: ["name","url_image"]
                }
            },
            // url_image: {
            //     type: "string",
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
            //     type: "array",
            //     of: {
            //         type: "map",
            //         properties: {
            //             prop1: {
            //                 type: "string",
            //                 name: "prop1"
            //             },
            //             prop2: {
            //                 type: "number",
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
            impacts: {
                name: "Impacts",
                validation: { required: true },
                type: "array",
                of: buildProperty({
                    type: "map",
                    properties: {
                        name: {
                            name: "Name",
                            validation: { required: true },
                            type: "string"
                        },
                        point1: {
                            name: "Point-1",
                            validation: { required: true },
                            type: "number"
                        },
                        point2: {
                            name: "Point-2",
                            validation: { required: true },
                            type: "number"
                        }
                    }
                })
            },
            // products: buildProperty(({ values }) => ({
            //     name: "Products",
            //     type: "array",
            //     of: {
            //         type: "reference",
            //         path: "products",
            //         forceFilter: {
            //             tags: ["array-contains", "test"]
            //         }
            //     }
            // }))
            // movement: buildProperty(({ values }) => {
            //     return {
            //         name: "Locale",
            //         type: "reference",
            //         path: !values.product ? false : values.product.path + "/" + values.product.id + "/locales"
            //     };
            // }),
            // form: {
            //     type: "array",
            //     name: "Form",
            //     of: formPropertyEntry
            // },
            // child_ref: {
            //     name: "Child reference",
            //     type: "reference",
            //     path: "ppp/B000P0MDMS/locales"
            // },
            // address: buildProperty({
            //     name: "Address",
            //     type: "map",
            //     properties: {
            //         street: {
            //             name: "Street",
            //             type: "string"
            //         },
            //         postal_code: {
            //             name: "Postal code",
            //             type: "number"
            //         }
            //     },
            //     spreadChildren: true,
            //     expanded: true
            // }),
            // name_number: {
            //     name: "Name starts with number",
            //     type: "string",
            //     validation:{
            //         // required: true,
            //         matches: /\d.*/,
            //         matchesMessage: "Must start with a number"
            //     }
            // },
            // shaped_array: {
            //     type: "array",
            //     of: [
            //         {
            //             type: "string",
            //             name: "Name"
            //         },
            //         {
            //             type: "number",
            //             name: "age"
            //         },
            //     ]
            // },
            // function_array: {
            //     type: "array",
            //     name: "Function array",
            //     of: ({ propertyValue, index }) => {
            //         return ({
            //             type: "string",
            //             name: "Name"
            //         });
            //     }
            // },
            // map_array_ref: {
            //     name: 'Map',
            //     type: 'map',
            //     expanded: false,
            //     properties: {
            //         child: {
            //             name: "Products",
            //             type: 'array',
            //             of: {
            //                 type: "reference",
            //                 path: "products",
            //                 previewProperties: ["name", "main_image"]
            //             },
            //         }
            //     },
            // },
            // source: ({ values, previousValues }) => {
            //     const properties = buildProperties<any>({
            //         type: {
            //             type: "string",
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
            //                 type: "string"
            //             });
            //         } else if ((values.source as any).type === "apple") {
            //             properties["appleId"] = buildProperty({
            //                 name: "Apple id",
            //                 type: "number"
            //             });
            //         }
            //     }
            //
            //     return ({
            //         type: "map",
            //         name: "Source",
            //         properties: properties
            //     });
            // },
            gallery: {
                name: "Gallery",
                type: "array",
                of: {
                    type: "string",
                    storage: {
                        storagePath: "images",
                        acceptedFiles: ["image/*"],
                        metadata: {
                            cacheControl: "max-age=1000000"
                        }
                    }
                }
            }

            // title: ({ values, entityId }) => {
            //     if (values?.available_locales && Array.isArray(values.available_locales)) {
            //         if (values.available_locales.includes("de"))
            //             return ({
            //                 type: "string",
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
            //         type: "string",
            //         name: "Title"
            //     });
            // },
            // number_enum: {
            //     type: "array",
            //     name: "Licences",
            //     of: {
            //         type: "number",
            //         enumValues: {
            //             0: "start",
            //             1: "standard",
            //             2: "premium"
            //         }
            //     }
            // },
            // simple_enum: {
            //     type: "string",
            //     name: "Simple enum",
            //     enumValues: {
            //         "facebook": "FacebookId",
            //         "apple": "Apple"
            //     }
            // },
            // simple_enum_2: {
            //     type: "string",
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
            //     type: "array",
            //     columnWidth: 450,
            //     oneOf: {
            //         typeField: "type",
            //         valueField: "value",
            //         properties: {
            //             name: {
            //                 name: "Title",
            //                 type: "string"
            //             },
            //             text: {
            //                 type: "string",
            //                 name: "Text",
            //                 markdown: true
            //             },
            //             products: {
            //                 type: "array",
            //                 name: "Product",
            //                 of: {
            //                     type: "reference",
            //                     path: "products"
            //                 }
            //             }
            //         }
            //     }
            // },
            // string_array: {
            //     name: "String array",
            //     type: "array",
            //     of: {
            //         type: "string"
            //     }
            // },
            // empty_string: {
            //     name: "Empty String",
            //     type: "string",
            //     validation: {
            //         unique: true
            //     }
            // },
            // disabled_product: {
            //     name: "Disabled product",
            //     type: "reference",
            //     path: "products",
            //     disabled: true,
            //     previewProperties: ["name", "main_image"]
            // },
            // products: {
            //     name: "Products",
            //     type: "array",
            //     of: {
            //         type: "reference",
            //         path: "products",
            //         previewProperties: ["name", "main_image"]
            //     }
            // },
            // mark: {
            //     name: "Mark",
            //     type: "string",
            //     markdown: true
            // },
            // custom_shaped_array: {
            //     name: "My shaped array",
            //     type: "array",
            //     Field: CustomShapedArrayField,
            //     Preview: CustomShapedArrayPreview,
            //     customProps: {
            //         properties: [
            //             buildProperty({
            //                 type: "string",
            //                 name: "Name"
            //             }),
            //             buildProperty({
            //                 type: "number",
            //                 name: "Age"
            //             })
            //         ]
            //     }
            // },
            // actions: {
            //     name: "Actions",
            //     description: "Possible user actions",
            //     type: "array",
            //     of: {
            //         type: "map",
            //         properties: {
            //             name: {
            //                 name: "Name",
            //                 description: "Text that will be shown on the button",
            //                 type: "string"
            //             },
            //             description: {
            //                 name: "Description",
            //                 type: "string"
            //             },
            //             type: {
            //                 name: "Type",
            //                 description: "Action type that determines the user flow",
            //                 validation: {  uniqueInArray: true },
            //                 type: "string",
            //                 enumValues: {
            //                     complete: "Complete",
            //                     continue: "Continue"
            //                 }
            //             },
            //             hidden_field: {
            //                 name: "Hidden",
            //                 type: "string",
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
            //     type: "array",
            //     of: {
            //         type: "string",
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
            //     type: "number",
            //     enumValues: relaxedStatus
            // },
            // available_dates: {
            //     type: "array",
            //     name: "Available Dates",
            //     of: {
            //         type: "date"
            //     }
            // },
            // images: {
            //     name: "Images",
            //     type: "array",
            //     of: {
            //         type: "string",
            //         storage: {
            //             storagePath: "images",
            //             acceptedFiles: ["image/*"]
            //         }
            //     }
            // },
            // image: {
            //     name: "Image",
            //     type: "string",
            //     storage: {
            //         storagePath: "test",
            //         acceptedFiles: ["image/*"]
            //     }
            // },
            // created_on: {
            //     name: "Created on",
            //     type: "date",
            //     autoValue: "on_create"
            // },
            // updated_on: {
            //     name: "Updated on",
            //     type: "date",
            //     autoValue: "on_update"
            // }
            // description: {
            //     name: "Description",
            //     type: "string"
            // },
            // search_adjacent: {
            //     name: "Search adjacent",
            //     type: "boolean"
            // },
            // difficulty: {
            //     name: "Difficulty",
            //     type: "number"
            // },
            // range: {
            //     name: "Range",
            //     validation: {
            //         min: 0,
            //         max: 3
            //     },
            //     type: "number"
            // },
            // read_only: {
            //     type: "string",
            //     name: "Read only",
            //     readOnly: true
            // },
            // pdf: buildProperty({
            //     name: "Pdf",
            //     type: "string",
            //     storage: {
            //         storagePath: "test",
            //         acceptedFiles: ['application/pdf'],
            //     }
            // }),
        }
        // additionalFields:
        //     [
        //         {
        //             key: "full_name",
        //             name: "Full Name",
        //             Builder: ({ entity }) => {
        //                 const values = entity.values;
        //                 return typeof values.name === "string" ? values.name.toUpperCase() : "Nope";
        //             },
        //             dependencies: ["name"]
        //         }
        //     ],
        // subcollections:
        //     [
        //         usersCollection
        //     ]
    })
;
