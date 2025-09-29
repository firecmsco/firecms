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
                        dataType: "string",
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
                                dataType: "string",
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

            basic_number: {
                dataType: "number",
                name: "Basic number",
                validation: {
                    min: 0,
                    max: 100
                }
            },
            basic: {
                dataType: "string",
                name: "Basic",
                validation: {
                    unique: true,
                }
            },
            ref_as_string: {
                dataType: "string",
                name: "Reference as string",
                reference: {
                    dataType: "reference",
                    path: "products",
                }
            },
            ref: {
                dataType: "reference",
                name: "Reference",
                path: "products",
            },

            // answers: ({ entityId }) => {
            //     return {
            //         name: "answers",
            //         dataType: "array",
            //         readOnly: entityId === "paragraph" ? true : false,
            //         validation: {
            //             min: 4,
            //             max: 4,
            //             required: entityId === "paragraph" ? false : true
            //         },
            //         of: {
            //             name: "answer",
            //             dataType: "map",
            //             properties: {
            //                 isCorrect: {
            //                     name: "isCorrect",
            //                     dataType: "boolean",
            //                     validation: { required: entityId === "paragraph" ? false : true }
            //                 },
            //                 text: {
            //                     name: "text",
            //                     dataType: "string",
            //                     validation: { required: entityId === "paragraph" ? false : true }
            //                 }
            //             }
            //         }
            //     }
            // },
            // test_upload: {
            //     dataType: "array",
            //     name: "Test upload",
            //     of: buildProperty({
            //         dataType: "string",
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
            //         dataType: "string",
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
                dataType: "string",
                name: "Multiline",
                multiline: true,
                defaultValue: "Hello\nWorld",
            },
            // date: {
            //     name: "My date",
            //     dataType: "date",
            //     // disabled: true
            //     autoValue: "on_create"
            // },
            // date_update: {
            //     name: "My date update",
            //     dataType: "date",
            //     autoValue: "on_update"
            // },
            //
            // test_date: {
            //     name: "Test date",
            //     dataType: "date",
            //     mode: "date_time",
            //     clearable: true
            // },
            locale: {
                name: "Locales",
                dataType: "string",
                enumValues: locales,
                clearable: true
            },
            available_locales: {
                name: "Available locales",
                dataType: "array",
                of: {
                    dataType: "string",
                    enumValues: locales
                }
            },
            image: {
                dataType: "string",
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
                dataType: "array",
                name: "Images",
                of: {
                    dataType: "string",
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
            //     dataType: "string",
            //     readOnly: true,
            //     name: "Read only"
            // },
            // contactDetails: {
            //     hideFromCollection: true,
            //     dataType: "array",
            //     name: "Contact details",
            //     of: {
            //         dataType: "map",
            //         name: "Contact info",
            //         previewProperties: ["data"],
            //         properties: {
            //             id: {
            //                 dataType: "string",
            //                 name: "ID (auto)",
            //                 // readOnly: true,
            //                 // Field: () => null,
            //                 defaultValue: crypto.randomUUID(),
            //             },
            //         },
            //     },
            // },
            // type: {
            //     dataType: "string",
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
            //                 dataType: "map",
            //                 name: "Seat config",
            //                 properties: {
            //                     category: {
            //                         dataType: "string",
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
            //                 dataType: "map",
            //                 name: "Cabin config",
            //                 properties: {
            //                     capacity: {
            //                         dataType: "number",
            //                         name: "Cabin capacity"
            //                     },
            //                     specialNeeds: {
            //                         dataType: "boolean",
            //                         name: "Special Needs"
            //                     }
            //                 }
            //             });
            //
            //         default:
            //             return {
            //                 dataType: "map",
            //                 disabled: true
            //             };
            //     }
            // },
            // isAdmin: {
            //     name: "Admin",
            //     dataType: "boolean",
            //     defaultValue: false
            // },
            // users: ({ values }) => {
            //     if (values.isAdmin)
            //         return null;
            //     return ({
            //         name: "Clients",
            //         dataType: "array",
            //         of: { dataType: "reference", path: "users", previewProperties: ["name"] }
            //     });
            // },

            // rerender: () => ({
            //     dataType: "map",
            //     hideFromCollection: true,
            //     Field: () => {
            //         console.log("Rerendering");
            //         return <div>Test</div>;
            //     }
            // }),
            body: buildProperty({
                name: "Body",
                validation: { required: false },
                dataType: "map",
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
                dataType: "map",
                minimalistView: true,
                name: "Size",
                properties: {
                    width: {
                        name: "Width",
                        dataType: "number",
                        validation: {
                            required: true
                        }
                    },
                    height: {
                        name: "Height",
                        dataType: "number",
                        validation: {
                            required: true
                        }
                    }
                },
                widthPercentage: 50
            },
            // background: {
            //     dataType: "number",
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
            //     dataType: "string",
            //     storage: {
            //         storagePath: "test",
            //         acceptedFiles: ["application/*"],
            //     }
            // },
            // file: {
            //     name: "File",
            //     description: "The uploaded file of the document.",
            //     hideFromCollection: false,
            //     dataType: "string",
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
            //     dataType: "array",
            //     of: {
            //         dataType: "map",
            //         properties: {
            //             type: {
            //                 name: "Type",
            //                 dataType: "string",
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
            //                         dataType: "number",
            //                         validation: {
            //                             min: 0,
            //                             max: 100
            //                         }
            //                     })
            //                 } else if (propertyValue?.type === "fromTo") {
            //                     return ({
            //                             name: "Saturation available range",
            //                             dataType: "map",
            //                             properties: {
            //                                 from: {
            //                                     name: "From",
            //                                     dataType: "number",
            //                                     validation: {
            //                                         min: 0,
            //                                         max: 100
            //                                     }
            //                                 },
            //                                 to: {
            //                                     name: "To",
            //                                     dataType: "number",
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
            //                         dataType: "string",
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
            //     dataType: "map",
            //     properties: {
            //         nested_1: {
            //             name: "Nested 1",
            //             dataType: "map",
            //             properties: {
            //                 nested_2: {
            //                     name: "Nested 2",
            //                     dataType: "map",
            //                     properties: {
            //                         nested_3: {
            //                             name: "Nested 3",
            //                             dataType: "map",
            //                             properties: {
            //                                 name: {
            //                                     name: "Name",
            //                                     dataType: "string"
            //                                 },
            //                                 num: {
            //                                     name: "Num",
            //                                     dataType: "number"
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
            //     dataType: "array",
            //     of: {
            //         name: "My enum",
            //         dataType: "string",
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
            //     dataType: "string",
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
                dataType: "array",
                // sortable: false,
                // canAddElements: false,
                of: {
                    dataType: "string"
                }
            },
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
            //
            // name: {
            //     dataType: "string",
            //     name: "Name"
            // },
            // key_value: {
            //     dataType: "map",
            //     name: "Key value",
            //     keyValue: true
            // },
            // test_string: {
            //     dataType: "string",
            //     name: "Test string",
            //     disabled: { hidden: true },
            //     validation: {
            //         required: true
            //     }
            // },
            // test_custom: {
            //     dataType: "string",
            //     name: "Test custom",
            //     propertyConfig: "test_custom_field"
            // },
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
            // self_ref: {
            //     name: "Self ref",
            //     dataType: "reference",
            //     path: "test_entity"
            // },
            self_refs: {
                dataType: "array",
                name: "Self references",
                of: {
                    dataType: "reference",
                    name: "Self refs",
                    path: "test_entity"
                    // previewProperties: ["name","url_image"]
                }
            },
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
            impacts: {
                name: "Impacts",
                validation: { required: true },
                dataType: "array",
                of: buildProperty({
                    dataType: "map",
                    properties: {
                        name: {
                            name: "Name",
                            validation: { required: true },
                            dataType: "string"
                        },
                        point1: {
                            name: "Point-1",
                            validation: { required: true },
                            dataType: "number"
                        },
                        point2: {
                            name: "Point-2",
                            validation: { required: true },
                            dataType: "number"
                        }
                    }
                })
            },
            // products: buildProperty(({ values }) => ({
            //     name: "Products",
            //     dataType: "array",
            //     of: {
            //         dataType: "reference",
            //         path: "products",
            //         forceFilter: {
            //             tags: ["array-contains", "test"]
            //         }
            //     }
            // }))
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
            gallery: {
                name: "Gallery",
                dataType: "array",
                of: {
                    dataType: "string",
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
            //     dataType: "string"
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
