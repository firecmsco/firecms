---
id: firebase_cms_app
title: FirebaseCMSApp
sidebar_label: FirebaseCMSApp
---

FireCMS works as a complete app that is in charge of creating the views that
you define based on your collections and entity schemas. It handles
navigation for you as well as authentication and login.

However, there is a lot of room to customization, including [custom top level views](custom_top_level_views.md),
[custom schema views](custom_schema_views.md), and [custom fields](custom_fields.md)
for your entity properties, in case the basic use cases we include don't suit your needs.

In the simplest case, you will want to create some properties, include them
in an entity schema, include it in a collection and include that in a CMS
instance.

## FirebaseCMSApp

The entry point for setting up a FireCMS app based on Firebase is the `FirebaseCMSApp`.
This component is in charge of building a full FireCMS instance, using Firebase Auth,
Firestore, and Firebase Storage as backend services.

Internally it will create a `CMSAppProvider` which holds the main state and
logic of the app, and create the app scaffold and routes.

:::note
It is also possible to use FireCMS by using lower level components and including
`CMSAppProvider` in your code, even without using Firebase.
[More info](custom_cms_app.md)
:::

You can define the following specs:

- `name`

  Name of the app, displayed as the main title and in the tab title.

- `navigation`

  Use this prop to specify the views that will be generated in the
  CMS. You will usually want to create a `Navigation` object that includes
  collection views where you specify the path and the schema. Additionally, you
  can add custom views to the root navigation. In you need to customize the
  navigation based on the logged user you can use a `NavigationBuilder`

- `logo`

  Logo to be displayed in the drawer of the CMS.

- `authentication`

  Do the users need to log in to access the CMS. You can
  specify an Authenticator function to discriminate which users can access the
  CMS or not. If not specified, authentication is enabled but no user
  restrictions apply.

- `signInOptions`

  List of sign in options that will be displayed in the login
  view if `authentication` is enabled. You can pass google providers strings,
  such as `firebase.auth.GoogleAuthProvider.PROVIDER_ID` or full configuration
  objects such as specified in https://firebase.google.com/docs/auth/web/firebaseui
  Defaults to Google sign in only.

- `allowSkipLogin`

  If authentication is enabled, allow the user to access the
  content without login.

- `firebaseConfig`

  Firebase configuration of the project. If you afe deploying
  the app to Firebase hosting, you don't need to specify this value.

- `onFirebaseInit`

  An optional callback after Firebase has been initialised.
  Useful for using the local emulator or retrieving the used configuration.

- `primaryColor`

  Primary color of the theme of the CMS.

- `secondaryColor`

  Primary color of the theme of the CMS.

- `fontFamily`

  Font family string. e.g. '"Roboto", "Helvetica", "Arial",
  sans-serif'.

- `toolbarExtraWidget`

  A component that gets rendered on the upper side of the
  main toolbar.

- `dateTimeFormat`

  Format of the dates in the CMS. Defaults to 'MMMM dd, yyyy,
  HH:mm:ss'

- `locale`

  Locale of the CMS, currently only affecting dates

- `schemaResolver`

  Used to override schemas based on the collection path and
  entityId. This resolver allows to override the schema for specific entities,
  or specific collections, app wide. This overrides schemas all through the app.
  You can also override schemas in place, when using `useSideEntityController`

