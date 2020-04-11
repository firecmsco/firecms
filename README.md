# FireCMS

> Awesome Firestore based CMS

FireCMS is a CMS built by developers for developers. It generates CRUD views
based on your configuration. 
You define views that are mapped to absolute paths in your Firestore database as
well as schemas for your entities.

Note that this is a full application, with routing enabled and not a simple 
component. It has only been tested as an application and not as part of a
different one.

It is currently in a pre-alpha state and we continue working to add features
and expose internal APIs, so it is safe to expect breaking changes.

[![NPM](https://img.shields.io/npm/v/firecms.svg)](https://www.npmjs.com/package/firecms) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

#### Core technologies

FireCMS is based on this great technologies:
 - Firebase
 - React + React Router
 - Material UI
 - Formik
 - Yup

#### Demo
https://firecms-demo-27150.web.app/

## Install

```bash
npm install --save firecms
```

## Firebase requirements

You need to enable the Firestore database in your Firebase project.
If you have enabled authentication in the CMS config you need to enable Google
authentication in your project.
Also if you enable any fields in your project to be of the storage type you
need to enable Firebase Storage.


## Deployment to Firebase hosting

If you are deploying this project to firebase hosting, you can omit the 
firebaseConfig specification, since it gets picked up automatically.


## Current status
- [x] Form for editing entities
- [x] Implementation of fields for every property (except Geopoint)
- [x] Native support for Google Storage references and file upload.
- [ ] Allow for custom fields defined by the developer
- [ ] Add specific field for some special cases where the generic solution
can be improved, such as array of storage components
- [ ] Geopoint field
- [x] Real-time Collection view for entities
- [x] Custom additional views in main navigation
- [ ] Delete entity function
- [ ] Improve error handling when unexpected formats come from Firestore
- [x] Subcollection support
- [ ] Filters (WIP)
- [ ] Implement custom authenticator so developers can select who has access to what
- [x] Required fields, yup implemented
- [ ] Additional Validation (all yup supported properties such as min or max value)
- [ ] Unit testing


## Usage

```tsx
import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import { CMSApp, EntitySchema, EnumValues } from "firecms";
import { EntitySchema, EnumValues } from "firecms";

const status = {
    private: "Private",
    public: "Public"
};

const categories: EnumValues<string> = {
    electronics: "Electronics",
    books: "Books",
    furniture: "Furniture",
    clothing: "Clothing",
    food: "Food"
};

const locales = {
    "de-DE": "German",
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "es-419": "Spanish (South America)"
};

export const productSchema: EntitySchema = {
    customId: true,
    name: "Product",
    properties: {
        name: {
            title: "Name",
            includeInListView: true,
            validation: { required: true },
            dataType: "string"
        },
        price: {
            title: "Price",
            includeInListView: true,
            validation: { required: true },
            dataType: "number"
        },
        status: {
            title: "Status",
            includeInListView: true,
            validation: { required: true },
            dataType: "string",
            enumValues: status
        },
        categories: {
            title: "Categories",
            includeInListView: true,
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string",
                enumValues: categories
            }
        },
        image: {
            title: "Image",
            dataType: "string",
            includeInListView: true,
            storageMeta: {
                mediaType: "image",
                storagePath: "images",
                acceptedFiles: ["image/*"]
            }
        },
        tags: {
            title: "Tags",
            includeInListView: true,
            description: "Example of generic array",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string"
            }
        },
        description: {
            title: "Description",
            description: "Not mandatory but it'd be awesome if you filled this up",
            includeInListView: false,
            dataType: "string"
        },
        published: {
            title: "Published",
            includeInListView: true,
            dataType: "boolean"
        },
        expires_on: {
            title: "Expires on",
            includeInListView: false,
            dataType: "timestamp"
        },
        publisher: {
            title: "Publisher",
            includeInListView: true,
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    title: "Name",
                    includeInListView: true,
                    dataType: "string"
                },
                external_id: {
                    title: "External id",
                    includeInListView: true,
                    dataType: "string"
                }
            }
        },
        available_locales: {
            title: "Available locales",
            description:
                "This field is set automatically by Cloud Functions and can't be edited here",
            includeInListView: true,
            dataType: "array",
            disabled: true,
            of: {
                dataType: "string"
            }
        }
    },
    subcollections: [
        {
            name: "Locales",
            relativePath: "locales",
            schema: {
                customId: locales,
                name: "Locale",
                properties: {
                    title: {
                        title: "Title",
                        validation: { required: true },
                        includeInListView: true,
                        dataType: "string"
                    },
                    selectable: {
                        title: "Selectable",
                        description: "Is this locale selectable",
                        includeInListView: true,
                        dataType: "boolean"
                    },
                    video: {
                        title: "Video",
                        dataType: "string",
                        validation: { required: false },
                        includeInListView: true,
                        storageMeta: {
                            mediaType: "video",
                            storagePath: "videos",
                            acceptedFiles: ["video/*"]
                        }
                    }
                }
            }
        }
    ]
};


const firebaseConfig = YOUR_FIREBASE_CONFIG;

ReactDOM.render(
    <CMSApp
        siteConfig={siteConfig}
        firebaseConfig={firebaseConfig}
    />,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
serviceWorker.unregister();
```


## License

GPL-3.0 © [camberi](https://github.com/camberi)
