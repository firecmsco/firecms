# FireCMS

> Awesome Firestore based headless CMS, developed by Camberi

FireCMS is a headless CMS built by developers for developers. It generates CRUD
views based on your configuration.
You define views that are mapped to absolute or relative paths in your Firestore
database, as well as schemas for your entities.

Note that this is a full application, with routing enabled and not a simple
component. It has only been tested as an application and not as part of a
different one.

It is currently in an alpha state, and we continue working to add features
and expose internal APIs, so it is safe to expect breaking changes.

[![NPM](https://img.shields.io/npm/v/@camberi/firecms.svg)](https://www.npmjs.com/package/@camberi/firecms) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

### Core technologies

FireCMS is based on this great technologies:
 - Typescript
 - Firebase
 - React + React Router
 - Material UI
 - Formik + Yup

### Demo

Check the demo with all the core functionalities. You can modify the data but it
gets periodically restored.

https://firecms-demo-27150.web.app/

## Install

```bash
npm install --save firecms
```

## Use

FireCMS is a purely a React app that uses your Firebase project as a backend
so you do not need a specific backend to make it run. Just build your project
following the installation instructions and deploy it in the way you prefer.
A very easy way is using Firebase Hosting.

## Firebase requirements

You need to enable the Firestore database in your Firebase project.
If you have enabled authentication in the CMS config you need to enable Google
authentication in your project.

Also, if you are using storage fields in your string properties, you need to
enable Firebase Storage


### Deployment to Firebase hosting

If you are deploying this project to firebase hosting, you can omit the
firebaseConfig specification, since it gets picked up automatically.

## Feature roadmap
- [x] Create, read, update, delete views
- [x] Form for editing entities
- [x] Implementation of fields for every property (except Geopoint)
- [x] Hooks on pre and post saving of entities
- [x] Native support for Google Storage references and file upload.
- [ ] Geopoint field
- [ ] Allow set up of a project using a CLI create-firecms-app
- [x] Real-time Collection view for entities
- [ ] Encoding pagination in URL for improved navigation
- [x] Custom additional views in main navigation
- [x] Custom fields defined by the developer.
- [ ] Improve error handling when unexpected formats come from Firestore
- [x] Subcollection support
- [x] Filters (only for string and numbers)
- [ ] Filters for arrays, dates
- [x] Custom authenticator
- [x] Validation for required fields using yup
- [ ] Conditional validation based on other fields
- [ ] Unit testing


## Quick example

```tsx
import React from "react";
import ReactDOM from "react-dom";

import "typeface-roboto";

import {
    Authenticator,
    CMSApp,
    EntityCollectionView,
    buildSchema,
} from "@camberi/firecms";
import { User } from "firebase/app";

// Replace with your config
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

const locales = {
    "de-DE": "German",
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "es-419": "Spanish (South America)"
};

const productSchema = buildSchema({
    name: "Product",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        price: {
            title: "Price",
            validation: {
                required: true,
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            description: "Price with range validation",
            dataType: "number"
        },
        status: {
            title: "Status",
            validation: { required: true },
            dataType: "string",
            description: "Should this product be visible in the website",
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            config:{
                enumValues: {
                    private: "Private",
                    public: "Public"
                }
            }
        },
        categories: {
            title: "Categories",
            validation: { required: true },
            dataType: "array",
            of: {
                dataType: "string",
                config:{
                    enumValues: {
                        electronics: "Electronics",
                        books: "Books",
                        furniture: "Furniture",
                        clothing: "Clothing",
                        food: "Food"
                    }
                }
            }
        },
        image: {
            title: "Image",
            dataType: "string",
            config:{
                storageMeta: {
                    mediaType: "image",
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            }
        },
        tags: {
            title: "Tags",
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
            longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
            dataType: "string",
            config: {
                forceFullWidth: true
            }
        },
        published: {
            title: "Published",
            dataType: "boolean"
        },
        expires_on: {
            title: "Expires on",
            dataType: "timestamp"
        },
        publisher: {
            title: "Publisher",
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    title: "Name",
                    dataType: "string"
                },
                external_id: {
                    title: "External id",
                    dataType: "string"
                }
            }
        }
    }
});

const localeSchema = buildSchema({
    customId: locales,
    name: "Locale",
    properties: {
        title: {
            title: "Title",
            validation: { required: true },
            dataType: "string"
        },
        selectable: {
            title: "Selectable",
            description: "Is this locale selectable",
            dataType: "boolean"
        },
        video: {
            title: "Video",
            dataType: "string",
            validation: { required: false },
            config:{
                storageMeta: {
                    mediaType: "video",
                    storagePath: "videos",
                    acceptedFiles: ["video/*"]
                }
            }
        }
    }
});

const navigation: EntityCollectionView<any>[] = [
    {
        relativePath: "products",
        schema: productSchema,
        name: "Products",
        subcollections: [
            {
                name: "Locales",
                relativePath: "locales",
                schema: localeSchema
            }
        ]
    }
];

const myAuthenticator: Authenticator = (user?: User) => {
    console.log("Allowing access to", user?.email);
    return true;
};

ReactDOM.render(
    <CMSApp
        name={"Test shop CMS"}
        authentication={myAuthenticator}
        navigation={navigation}
        firebaseConfig={firebaseConfig}
    />,
    document.getElementById("root")
);

```

#### Included example

You can access the code for the demo project under
[`example`](https://github.com/Camberi/firecms/tree/master/example). It includes
every feature provided by this CMS.

To get going you just need to set you Firebase config in `firebase_config.ts`
and run `yarn start`


#### Real time support

Every view in the CMS has real time data support. This makes it suitable for
displaying data that needs to be always updated.

**Forms** also support this feature, any modified value in the database will be
updated in any currently open form view, as long as it has not been touched by
the user. This makes it suitable for advanced cases where you trigger a Cloud
Function after saving an entity that modifies some values, and you want to get
real time updates.


## Entities configuration

The core of the CMS are entities, which are defined by an `EntitySchema`. In the
schema you define the properties, which are related to the Firestore data types.

  - `name`: A singular name of the entity as displayed in an Add button.
        E.g. Product

  - `description`: Description of this entity

  - `customId`: When not specified, Firestore will create a random ID.
        You can set the value to true to allow the users to choose the ID.
        You can also pass a set of values (as an `EnumValues` object) to allow them
        to pick from only those.

  - `properties`: Object defining the properties for the entity schema


Entity properties
-----------------

You can specify the properties of an entity, using the following configuration
fields, common to all data types:

* `dataType`: Firestore datatype of the property

* `title`: Property title (e.g. Product)

* `description`: Property description

* `disabled`: Is this a read only property

* `config`:
    * `field`: If you need to render a custom field.

    * `fieldProps`: Additional props that are passed to the default field
        generated by FireCMS or to the custom field

    * `forceFullWidth`: Whether if this field should take the full width in the
        field. Defaults to false, but some fields like images take full width by
        default.

    * `customPreview`: Configure how a property is displayed as a preview,
        e.g. in the collection view

* `onPreSave`: Hook called before saving, you need to return the values that
        will get saved. If you throw an error in this method the process stops,
        and an error snackbar gets displayed. (example bellow)

* `onSaveSuccess`: Hook called when save is successful

* `onPreSave`: Hook called when saving fails


#### Property configurations

Besides the common fields, some properties have specific configurations.

##### `string`

* `config`:
    * `storageMeta`: You can specify a `StorageMeta` configuration. It is used to
            indicate that this string refers to a path in Google Cloud Storage.
    * `urlMediaType`: If the value of this property is a URL, we can use the
            urlMediaType to render the content
    * `enumValues`: You can use the enum values providing a map of possible
            exclusive values the property can take, mapped to the label that it is
            displayed in the dropdown.

* `validation`: Rules for validating this property:
    * `required`: Should this field be compulsory
    * `requiredMessage`: Message to be displayed as a validation error
    * `length`: Set a required length for the string value
    * `min`: Set a minimum length limit for the string value
    * `max`: Set a maximum length limit for the string value
    * `matches`: Provide an arbitrary regex to match the value against
    * `email`: Validates the value as an email address via a regex
    * `url`: Validates the value as a valid URL via a regex
    * `trim`: Transforms string values by removing leading and trailing whitespace
    * `lowercase`: Transforms the string value to lowercase
    * `uppercase`: Transforms the string value to uppercase

##### `number`

* `config`:
    * `enumValues`: You can use the enum values providing a map of possible
        exclusive values the property can take, mapped to the label that it is
        displayed in the dropdown.

* `validation`: Rules for validating this property
    * `required`: Should this field be compulsory
    * `requiredMessage`: Message to be displayed as a validation error
    * `min`: Set the minimum value allowed
    * `max`: Set the maximum value allowed
    * `lessThan`: Value must be less than
    * `moreThan`: Value must be more than
    * `positive`: Value must be a positive number
    * `negative`: Value must be a negative number
    * `integer`: Value must be an integer

##### `boolean`

* `validation`: Rules for validating this property
    * `required`: Should this field be compulsory
    * `requiredMessage`: Message to be displayed as a validation error

##### `timestamp`

* `validation`: Rules for validating this property
    * `required`: Should this field be compulsory
    * `requiredMessage`: Message to be displayed as a validation error
    * `min`: Set the minimum date allowed
    * `max`: Set the maximum date allowed

##### `reference`

* `collectionPath`: Absolute collection path.

* `schema`: Schema of the entity this reference points to.

* `filter`: When the dialog for selecting the value of this reference, should
         a filter be applied to the possible entities.

* `previewProperties`: List of properties rendered as this reference preview.
        Defaults to first 3.

* `validation`: Rules for validating this property
    * `required`: Should this field be compulsory
    * `requiredMessage`: Message to be displayed as a validation error

##### `array`

* `of`: The property of this array. You can specify any property.
        You can also specify an array or properties if you need the array to have
        a specific limited shape such as [string, number, string]

* `validation`: Rules for validating this property
    * `required`: Should this field be compulsory
    * `requiredMessage`: Message to be displayed as a validation error
    * `min`: Set the minimum length allowed
    * `max`: Set the maximum length allowed

##### `map`

* `properties`: Record of properties included in this map.

* `previewProperties`: List of properties rendered as this map preview.
        Defaults to first 3.

* `validation`: Rules for validating this property
    * `required`: Should this field be compulsory
    * `requiredMessage`: Message to be displayed as a validation error

##### `geopoint`
*THIS PROPERTY IS CURRENTLY NOT SUPPORTED*

#### Custom fields

If you need a custom field for your property you can do it by passing a React
component to the `field` prop of a property `config`. The React component must
accept the props of type `CMSFieldProps`, which you can extend with your own
props. `CMSFieldProps` extends at the same time from `FieldProps` in Formik, so
you can implement a Formik field.

If you want your custom field to take the full width of the form, you can use
the `forceFullWidth` property.

See how it works in this [sample custom text field](https://github.com/Camberi/firecms/blob/master/example/src/custom_field/CustomColorTextField.tsx)


#### Saving hooks

When you are saving an entity you can attach different hooks before and after
it gets saved: `onPreSave`, `onSaveSuccess` and `onSaveFailure`

```
const productSchema = buildSchema({
    customId: true,
    name: "Product",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        uppercase_name: {
            title: "Uppercase Name",
            dataType: "string",
            disabled: true,
            description: "This field gets updated with a preSave hook"
        },
    }
});

productSchema.onPreSave = ({
                               schema,
                               collectionPath,
                               id,
                               values,
                               status
                           }: EntitySaveProps<typeof productSchema>) => {
    values.uppercase_name = values.name.toUpperCase();
    return values;
};
```


Collection configuration
------------------------
Once you have defined at least one entity schema, you can include it in a
collection. You can find collection views as the first level of navigation in
the main menu, or as subcollections inside other collections, following the
Firestore data schema.

* `name`: The plural name of the view. E.g. 'products'.

* `relativePath`: Relative Firestore path of this view to its parent.
        If this view is in the root the path is equal to the absolute one.
        This path also determines the URL in FireCMS

* `schema`: Schema representing the entities of this view

* `properties`: List of properties included in this collection. Defaults to all.

* `filterableProperties`: List of properties that include a filter widget. Defaults to
        none.

* `initialFilter`: Initial filters applied to this collection. Consider that you
        can filter any property, but only those included in
        `filterableProperties` will include the corresponding filter widget.
        Defaults to none.

* `pagination`: Is pagination enabled in this view. Defaults to true

* `additionalColumns`: You can add additional columns to the collection view
        by implementing an additional column delegate.

* `textSearchDelegate`: If a text search delegate is supplied, a search bar
        is displayed on top.

* `deleteEnabled`: Can the elements in this collection be deleted.
        Defaults to true

* `subcollections`: Following the Firestore document and collection schema,
        you can add subcollections to your entity in the same way you define
        the root collections.

* `onEntityDelete`: Hook called after the entity gets deleted in Firestore.

### Additional columns

If you would like to include a column that does not map directly to a property,
you can use the `additionalColumns` field, providing a
`AdditionalColumnDelegate`, which includes a title and a builder that receives
the corresponding entity.

In the builder you can return any React Component.

If you would like to do some async computation, such as fetching a different
entity, you can use the utility component `AsyncPreviewComponent` to show a
loading indicator.

### Subcollections

Subcollections are collections of entities that are found under another entity.
For example, you can have a collection named "translations" under the entity
"Article". You just need to use the same format as for defining your collection
using the field `subcollections`.

### Filters

Filtering support is currently limited to string and number values, including
enum types. If you want a property to be filterable, you can mark it as such in
the entity schema.

Any comments related to this feature are welcome.

### Text search

Firestore does not support native text search, so we need to rely on external
solutions. If you specify a `textSearchDelegate` to the collection view, you
will see a search bar on top. The delegate is in charge of returning the
matching ids, from the search string.

A delegate using AlgoliaSearch is included, where you need to specify your
credentials and index. For this to work you need to set up an AlgoliaSearch
account and manage the indexing of your documents. There is a full backend
example included in the code, which indexes documents with Cloud Functions.


## License

GPL-3.0 © [camberi](https://github.com/camberi)
