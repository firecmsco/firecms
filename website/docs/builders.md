---
id: builders
title: Builder functions
sidebar_label: Builder functions
---

FireCMS works as a complete app that is in charge of creating the views that
you define based on your collections and entity schemas. It handles
navigation for you as well as authentication and login.

However, there is a lot of room to customization, including custom views
and custom fields for your entity properties, in case the basic use cases
we include don't suit your needs.

In the simplest case, you will want to create some properties


## CMSApp

The entry point for setting up a FireCMS app is the `CMSApp`, where you can
define the following specs:

- `name` Name of the app, displayed as the main title and in the tab title.

- `navigation` Use this prop to specify the views that will be generated in the
  CMS. You will usually want to create a `Navigation` object that includes
  collection views where you specify the path and the schema. Additionally, you
  can add custom views to the root navigation. In you need to customize the
  navigation based on the logged user you can use a `NavigationBuilder`

- `logo` Logo to be displayed in the drawer of the CMS.

- `authentication` Do the users need to log in to access the CMS. You can
  specify an Authenticator function to discriminate which users can access the
  CMS or not. If not specified, authentication is enabled but no user
  restrictions apply.

- `signInOptions` List of sign in options that will be displayed in the login
  view if `authentication` is enabled. You can pass google providers strings,
  such as `firebase.auth.GoogleAuthProvider.PROVIDER_ID` or full configuration
  objects such as specified
  in https://firebase.google.com/docs/auth/web/firebaseui
  Defaults to Google sign in only.

- `allowSkipLogin` If authentication is enabled, allow the user to access the
  content without login.

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

- `dateTimeFormat` Format of the dates in the CMS. Defaults to 'MMMM dd, yyyy,
  HH:mm:ss'

- `locale` Locale of the CMS, currently only affecting dates

- `schemaResolver`  Used to override schemas based on the collection path and
  entityId. This resolver allows to override the schema for specific entities,
  or specific collections, app wide. This overrides schemas all through the app.
  You can also override schemas in place, when using `useSideEntityController`



#### More granular control

If you don't want to use FireCMS `CMSApp` as a full app but would like to
integrate some of its components you may want to use the `CMSAppProvider`
and `CMSMainView`
components (used internally) directly.

This will allow you to initialise Firebase on your own and integrate the FireCMS
components into your own app. Just place `CMSAppProvider` on top of the
components that need to use the FireCMS hooks.

You can see an
example [here](https://github.com/Camberi/firecms/blob/master/example/src/SimpleAppWithProvider.tsx)

