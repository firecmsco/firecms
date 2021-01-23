# FireCMS

> Awesome Firestore based headless CMS, developed by Camberi

FireCMS is a headless CMS and admin panel built by developers for developers. It
generates CRUD views based on your configuration. You define views that are
mapped to absolute or relative paths in your Firestore database, as well as
schemas for your entities.

Note that this is a full application, with routing enabled and not a simple
component. It has only been tested as an application and not as part of a
different one.

It is currently in an alpha state, and we continue working to add features and
expose internal APIs, so it is safe to expect breaking changes.

[![NPM](https://img.shields.io/npm/v/@camberi/firecms.svg)](https://www.npmjs.com/package/@camberi/firecms) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

### Core technologies

FireCMS is based on this great technologies:

- Typescript
- Firebase
- React + React Router
- Material UI
- Formik + Yup

### Demo

Check the demo with all the core functionalities. You can modify the data, but
it gets periodically restored.

https://firecms-demo-27150.web.app/

### Changelog

https://github.com/Camberi/firecms/blob/master/CHANGELOG.md

## Install

In your React project, simply install the dependency.

```bash
npm install @camberi/firecms
```
or
```bash
yarn add @camberi/firecms
```

## Use

FireCMS is a purely a React app that uses your Firebase project as a backend, so
you do not need a specific backend to make it run. Just build your project
following the installation instructions and deploy it in the way you prefer. A
very easy way is using Firebase Hosting.

## Firebase requirements

You need to enable the Firestore database in your Firebase project. If you have
enabled authentication in the CMS config you need to enable Google
authentication in your project.

Also, if you are using storage fields in your string properties, you need to
enable Firebase Storage.

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
- [x] Collection text search integration
- [x] Infinite scrolling in collections
- [x] Drag and drop reordering of arrays
- [x] Custom additional views in main navigation
- [x] Custom fields defined by the developer.
- [x] Subcollection support
- [x] Filters (string, numbers and booleans)
- [ ] Filters for arrays, dates
- [x] Custom authenticator
- [x] Validation for required fields using yup
- [ ] Conditional validation based on other fields
- [ ] Unit testing

## Quick example

```tsx
import React from "react";

import {
    Authenticator,
    buildCollection,
    buildSchema,
    CMSApp,
    EntityCollectionView
} from "@camberi/firecms";
import firebase from "firebase/app";
import "typeface-rubik";

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
            config: {
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
                config: {
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
            config: {
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
            columnWidth: 300
        },
        published: {
            title: "Published",
            dataType: "boolean",
            columnWidth: 100
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
        },
        expires_on: {
            title: "Expires on",
            dataType: "timestamp"
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
            config: {
                storageMeta: {
                    mediaType: "video",
                    storagePath: "videos",
                    acceptedFiles: ["video/*"]
                }
            }
        }
    }
});

export function SimpleApp() {

    const navigation: EntityCollectionView[] = [
        buildCollection({
            relativePath: "products",
            schema: productSchema,
            name: "Products",
            subcollections: [
                buildCollection({
                    name: "Locales",
                    relativePath: "locales",
                    schema: localeSchema
                })
            ]
        })
    ];

    const myAuthenticator: Authenticator = (user?: firebase.User) => {
        console.log("Allowing access to", user?.email);
        return true;
    };

    return <CMSApp
        name={"My Online Shop"}
        authentication={myAuthenticator}
        navigation={navigation}
        firebaseConfig={firebaseConfig}
    />;
}

ReactDOM.render(
    <SimpleApp/>,
    document.getElementById("root")
);
```

#### Included example

You can access the code for the demo project under
[`example`](https://github.com/Camberi/firecms/tree/master/example). It includes
every feature provided by this CMS.

To get going you just need to set you Firebase config in `firebase_config.ts`
and run `yarn start`.

#### Real time support

Every view in the CMS has real time data support. This makes it suitable for
displaying data that needs to be always updated.

**Forms** also support this feature, any modified value in the database will be
updated in any currently open form view, as long as it has not been touched by
the user. This makes it suitable for advanced cases where you trigger a Cloud
Function after saving an entity that modifies some values, and you want to get
real time updates.

## CMSApp level configuration

The entry point for setting up a FireCMS app is the CMSApp, where you can define
the following specs:

- `name` Name of the app, displayed as the main title and in the tab title.

- `navigation` List of the views in the CMS. Each view relates to a collection
  in the root Firestore database. Each of the navigation entries in this field
  generates an entry in the main menu.

- `logo` Logo to be displayed in the drawer of the CMS.

- `authentication` Do the users need to log in to access the CMS. You can
  specify an Authenticator function to discriminate which users can access the
  CMS or not. If not specified, authentication is enabled but no user
  restrictions apply.

- `allowSkipLogin` If authentication is enabled, allow the user to access the
  content without login.

- `additionalViews` Custom additional views created by the developer, added to
  the main navigation.

- `firebaseConfig` Firebase configuration of the project. If you afe deploying
  the app to Firebase hosting, you don't need to specify this value.

- `onFirebaseInit` An optional callback after Firebase has been initialised.
  Useful for using the local emulator or retrieving the used configuration.

- `primaryColor` Primary color of the theme of the CMS.

- `secondaryColor` Primary color of the theme of the CMS.

- `fontFamily` Font family string. e.g. '"Roboto", "Helvetica", "Arial",
  sans-serif'.

- `toolbarExtraWidget` A component that gets rendered on the upper side of the
  main toolbar.

## Entities configuration

The core of the CMS are entities, which are defined by an `EntitySchema`. In the
schema you define the properties, which are related to the Firestore data types.

- `name` A singular name of the entity as displayed in an Add button. E.g.
  Product

- `description` Description of this entity.

- `customId` When not specified, Firestore will create a random ID. You can set
  the value to `true` to allow the users to choose the ID. You can also pass a
  set of values (as an `EnumValues` object) to allow them to pick from only
  those.

- `properties` Object defining the properties for the entity schema.

### Entity properties

You can specify the properties of an entity, using the following configuration
fields, common to all data types:

* `dataType` Firestore datatype of the property.

* `title` Property title (e.g. Product).

* `description` Property description.

* `longDescription` Width in pixels of this column in the collection view. If
  not set the width is inferred based on the other configurations.

* `columnWidth` Longer description of a field, displayed under a popover.

* `disabled` Is this a read only property.

* `config`
    * `field` If you need to render a custom field, you can pass a React
      component taking CMSFieldProps as props. More details below.

    * `fieldProps` Additional props that are passed to the default field
      generated by FireCMS or to the custom field.

    * `customPreview` Configure how a property is displayed as a preview, e.g.
      in the collection view.

* `onPreSave` Hook called before saving, you need to return the values that will
  get saved. If you throw an error in this method the process stops, and an
  error snackbar gets displayed. (example bellow)

* `onSaveSuccess` Hook called when save is successful.

* `onPreSave` Hook called when saving fails.

* `defaultValues` Object defining the initial values of the entity on creation.

#### Property configurations

Beside the common fields, some properties have specific configurations.

##### `string`

* `config`
    * `storageMeta` You can specify a `StorageMeta` configuration. It is used to
      indicate that this string refers to a path in Google Cloud Storage.
        * `mediaType` Media type of this reference, used for displaying the
          preview.
        * `storagePath` Absolute path in your bucket.
        * `acceptedFiles` File MIME types that can be uploaded to this
          reference.
        * `metadata` Specific metadata set in your uploaded file.
        * `storeUrl`  When set to `true`, this flag indicates that the download
          URL of the file will be saved in Firestore instead of the Cloud
          storage path. Note that the generated URL may use a token that, if
          disabled, may make the URL unusable and lose the original reference to
          Cloud Storage, so it is not encouraged to use this flag. Defaults to
          false.
    * `url` If the value of this property is a URL, you can set this flag
      to `true`
      to add a link, or one of the supported media types to render a preview.
    * `enumValues` You can use the enum values providing a map of possible
      exclusive values the property can take, mapped to the label that it is
      displayed in the dropdown.
    * `multiline` Is this string property long enough, so it should be displayed
      in a multiple line field. Defaults to false. If set to `true`, the number
      of lines adapts to the content.
    * `markdown` Should this string property be displayed as a markdown field.
      If `true`, the field is rendered as a text editors that supports markdown
      highlight syntax. It also includes a preview of the result.
    * `previewAsTag` Should this string be rendered as a tag instead of just
      text.

* `validation` Rules for validating this property:
    * `required` Should this field be compulsory.
    * `requiredMessage` Message to be displayed as a validation error.
    * `length` Set a required length for the string value.
    * `min` Set a minimum length limit for the string value.
    * `max` Set a maximum length limit for the string value.
    * `matches` Provide an arbitrary regex to match the value against.
    * `email` Validates the value as an email address via a regex.
    * `url` Validates the value as a valid URL via a regex.
    * `trim` Transforms string values by removing leading and trailing
      whitespace.
    * `lowercase` Transforms the string value to lowercase.
    * `uppercase` Transforms the string value to uppercase.

##### `number`

* `config`
    * `enumValues` You can use the enum values providing a map of possible
      exclusive values the property can take, mapped to the label that it is
      displayed in the dropdown.

* `validation` Rules for validating this property.
    * `required` Should this field be compulsory.
    * `requiredMessage` Message to be displayed as a validation error.
    * `min` Set the minimum value allowed.
    * `max` Set the maximum value allowed.
    * `lessThan` Value must be less than.
    * `moreThan` Value must be more than.
    * `positive` Value must be a positive number.
    * `negative` Value must be a negative number.
    * `integer` Value must be an integer.

##### `boolean`

* `validation` Rules for validating this property.
    * `required` Should this field be compulsory.
    * `requiredMessage` Message to be displayed as a validation error.

##### `timestamp`

* `validation` Rules for validating this property.
    * `required` Should this field be compulsory.
    * `requiredMessage` Message to be displayed as a validation error.
    * `min` Set the minimum date allowed.
    * `max` Set the maximum date allowed.

##### `reference`

* `collectionPath` Absolute collection path of the collection this reference
  points to. The schema of the entity is inferred based on the root navigation,
  so the filters and search delegate existing there are applied to this view as
  well.

* `previewProperties` List of properties rendered as this reference preview.
  Defaults to first 3.

* `validation` Rules for validating this property.
    * `required` Should this field be compulsory.
    * `requiredMessage` Message to be displayed as a validation error.

##### `array`

* `of` The property of this array. You can specify any property. You can also
  specify an array or properties if you need the array to have a specific
  limited shape such as [string, number, string].

* `validation` Rules for validating this property.
    * `required` Should this field be compulsory.
    * `requiredMessage` Message to be displayed as a validation error.
    * `min` Set the minimum length allowed.
    * `max` Set the maximum length allowed.

##### `map`

* `properties` Record of properties included in this map.

* `previewProperties` List of properties rendered as this map preview. Defaults
  to first 3.

* `validation` Rules for validating this property.
    * `required` Should this field be compulsory.
    * `requiredMessage` Message to be displayed as a validation error.

##### `geopoint`

*THIS PROPERTY IS CURRENTLY NOT SUPPORTED*

#### Custom fields

If you need a custom field for your property you can do it by passing a React
component to the `field` prop of a property `config`. The React component must
accept the props of type `CMSFieldProps`, which you can extend with your own
props. The bare minimum you need to implement is a field that displays the
received `value` and uses the `setValue` callback.

See how it works in
this [sample custom text field](https://github.com/Camberi/firecms/blob/master/example/src/custom_field/CustomColorTextField.tsx)

You can find the all
the `CMSFieldProps` [here](https://github.com/Camberi/firecms/blob/master/src/form/form_props.tsx)

#### Saving hooks

When you are saving an entity you can attach different hooks before and after it
gets saved: `onPreSave`, `onSaveSuccess` and `onSaveFailure`.

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

## Collection configuration

Once you have defined at least one entity schema, you can include it in a
collection. You can find collection views as the first level of navigation in
the main menu, or as subcollections inside other collections, following the
Firestore data schema.

* `name` The plural name of the view. E.g. 'products'.

* `relativePath` Relative Firestore path of this view to its parent. If this
  view is in the root the path is equal to the absolute one. This path also
  determines the URL in FireCMS.

* `defaultSize` Default size of the rendered collection.

* `size` Optional field used to group top level navigation entries under a
  navigation view. If you set this value in a subcollection it has no effect.

* `group` Optional field used to group top level navigation entries under a
  navigation view. If you set this value in a subcollection it has no effect.

* `properties` Properties displayed in this collection. If this property is not
  set every property is displayed.

* `excludedProperties` Properties that should NOT get displayed in the
  collection view. All the other properties from the entity are displayed. It
  has no effect if the `properties` value is set.

* `filterableProperties` List of properties that include a filter widget.
  Defaults to none.

* `initialFilter` Initial filters applied to this collection. Consider that you
  can filter any property, but only those included in
  `filterableProperties` will include the corresponding filter widget. Defaults
  to none.

* `extraActions` Builder for rendering additional components such as buttons in
  the collection toolbar. The builder takes an object with
  props `entityCollectionView`  and `selectedEntities` if any are set by the end
  user.

* `pagination` If enabled, content is loaded in batch. If `false` all entities
  in the collection are loaded. Defaults to `true`.

* `additionalColumns` You can add additional columns to the collection view by
  implementing an additional column delegate.

* `textSearchDelegate` If a text search delegate is supplied, a search bar is
  displayed on top.

* `editEnabled` Can the elements in this collection be added and edited.
  Defaults to `true`.

* `inlineEditing` Can the elements in this collection be edited inline in the
  collection view. If this flag is set to false but `editEnabled` is `true`,
  entities can still be edited in the side panel.

* `deleteEnabled` Can the elements in this collection be deleted. Defaults
  to `true`.

* `subcollections` Following the Firestore document and collection schema, you
  can add subcollections to your entity in the same way you define the root
  collections.

* `onEntityDelete` Hook called after the entity gets deleted in Firestore.

### Additional columns

If you would like to include a column that does not map directly to a property,
you can use the `additionalColumns` field, providing a
`AdditionalColumnDelegate`, which includes an id, a title, and a builder that
receives the corresponding entity.

In the builder you can return any React Component.

If you would like to do some async computation, such as fetching a different
entity, you can use the utility component `AsyncPreviewComponent` to show a
loading indicator.

### Subcollections

Subcollections are collections of entities that are found under another entity.
For example, you can have a collection named "translations" under the entity
"Article". You just need to use the same format as for defining your collection
using the field `subcollections`.

Subcollections are easily accessible from the side view while editing an entity.

### Filters

Filtering support is currently limited to string, number and boolean values,
including enum types. If you want a property to be filterable, you can mark it
as such in the entity schema.

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

You can also implement your own `TextSearchDelegate`, and would love to hear how
you come around this problem.

## Provided hooks

FireCMS provides different hooks that allow you to interact with the internal
state of the app. Please note that in order to use this hook you **must** be in
a component (you can't use them directly from a callback function).

### Auth Context

`useAuthContext`
For state and operations regarding authentication.

The props provided by this context are:

* `loggedUser` The Firebase user currently logged in or null
* `authProviderError` Error dispatched by the auth provider
* `authLoading` Is the login process ongoing
* `loginSkipped` Is the login skipped
* `notAllowedError` The current user was not allowed access
* `googleSignIn()` Start Google sign in flow
* `skipLogin()` Skip login
* `signOut()` Sign out

Example:

```tsx

import React from "react";
import { useAuthContext } from "@camberi/firecms";

export function ExampleAdditionalView() {

    const authContext = useAuthContext();

    return authContext.loggedUser ?
        <div>Logged in as {authContext.loggedUser.displayName}</div>
        :
        <div>You are not logged in</div>;
}
```

### Snackbar controller

`useSnackbarController`
For displaying snackbars

The props provided by this context are:

* `isOpen` Is there currently an open snackbar
* `close()` Close the currently open snackbar

* `open ({ type: "success" | "info" | "warning" | "error"; title?: string; message: string; })`
  Display a new snackbar. You need to specify the type and message. You can
  optionally specify a title

Example:

```tsx

import React from "react";
import { useSnackbarController } from "@camberi/firecms";

export function ExampleAdditionalView() {

    const snackbarController = useSnackbarController();

    return (
        <Button
            onClick={() => snackbarController.open({
                type: "success",
                title: "Hey!",
                message: "Test snackbar"
            })}>
            Click me
        </Button>
    );
}
```

## Contact

`francesco@camberi.com`

## License

GPL-3.0 © [camberi](https://github.com/camberi)
