---
id: "FirebaseCMSAppProps"
title: "Type alias: FirebaseCMSAppProps"
sidebar_label: "FirebaseCMSAppProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **FirebaseCMSAppProps**: `Object`

Main entry point that defines the CMS configuration

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `HomePage?` | `React.ComponentType` | In case you need to override the home page. You may want to use [useNavigationContext](../functions/useNavigationContext.md) in order to get the resolved navigation. |
| `LoginView?` | `React.ComponentType`<[`FirebaseLoginViewProps`](../interfaces/FirebaseLoginViewProps.md)\> | Additional props passed to the login view. You can use this props to disable registration in `password` mode, or to set up an additional message. Also, to add additional views to the login screen or disable the buttons. |
| `allowSkipLogin?` | `boolean` | If authentication is enabled, allow the user to access the content without login. |
| `appCheckOptions?` | [`AppCheckOptions`](../interfaces/AppCheckOptions.md) | Use this to enable Firebase App Check |
| `authentication?` | `boolean` \| [`Authenticator`](Authenticator.md)<`FirebaseUser`\> | Do the users need to log in to access the CMS. You can specify an Authenticator function to discriminate which users can access the CMS or not. If not specified, authentication is enabled but no user restrictions apply |
| `autoOpenDrawer?` | `boolean` | Open the drawer on hover. Defaults to `false` |
| `baseCollectionPath?` | `string` | Default path under the collection routes of the CMS will be created |
| `basePath?` | `string` | Default path under the navigation routes of the CMS will be created |
| `collections?` | [`EntityCollection`](../interfaces/EntityCollection.md)[] \| [`EntityCollectionsBuilder`](EntityCollectionsBuilder.md) | List of the mapped collections in the CMS. Each entry relates to a collection in the root database. Each of the navigation entries in this field generates an entry in the main menu. |
| `dateTimeFormat?` | `string` | Format of the dates in the CMS. Defaults to 'MMMM dd, yyyy, HH:mm:ss' |
| `fields?` | `Record`<`string`, [`FieldConfig`](FieldConfig.md)\> | Record of custom form fields to be used in the CMS. You can use the key to reference the custom field in the `fieldConfig` prop of a property in a collection. |
| `firebaseConfig?` | `Record`<`string`, `unknown`\> | Firebase configuration of the project. If you afe deploying the app to Firebase hosting, you don't need to specify this value |
| `firestoreIndexesBuilder?` | [`FirestoreIndexesBuilder`](FirestoreIndexesBuilder.md) | Use this builder to indicate which indexes are available in your Firestore database. This is used to allow filtering and sorting for multiple fields in the CMS. |
| `fontFamily?` | `string` | Font family string e.g. '"Roboto", "Helvetica", "Arial", sans-serif' |
| `locale?` | [`Locale`](Locale.md) | Locale of the CMS, currently only affecting dates |
| `logo?` | `string` | Logo to be displayed in the drawer of the CMS. If not specified, the FireCMS logo will be used |
| `logoDark?` | `string` | Logo used in dark mode. If not specified, `logo` will always be used. |
| `name` | `string` | Name of the app, displayed as the main title and in the tab title |
| `onAnalyticsEvent?` | (`event`: [`CMSAnalyticsEvent`](CMSAnalyticsEvent.md), `data?`: `object`) => `void` | Callback used to get analytics events from the CMS |
| `onFirebaseInit?` | (`config`: `object`, `app`: `FirebaseApp`) => `void` | Optional callback after Firebase has been initialised. Useful for using the local emulator or retrieving the used configuration. |
| `plugins?` | [`FireCMSPlugin`](FireCMSPlugin.md)[] | Use plugins to modify the behaviour of the CMS. Currently, in ALPHA, and likely subject to change. |
| `primaryColor?` | `string` | Primary color of the theme of the CMS |
| `secondaryColor?` | `string` | Secondary color of the theme of the CMS |
| `signInOptions?` | ([`FirebaseSignInProvider`](FirebaseSignInProvider.md) \| [`FirebaseSignInOption`](FirebaseSignInOption.md))[] | List of sign in options that will be displayed in the login view if `authentication` is enabled. You can pass Firebase providers strings, such as `firebase.auth.GoogleAuthProvider.PROVIDER_ID` or include additional config such as scopes or custom parameters [FirebaseSignInOption](FirebaseSignInOption.md) Defaults to Google sign in only. |
| `textSearchController?` | [`FirestoreTextSearchController`](FirestoreTextSearchController.md) | Use this controller to return text search results as document ids, that get then fetched from Firestore. |
| `toolbarExtraWidget?` | `React.ReactNode` | A component that gets rendered on the upper side of the main toolbar |
| `views?` | [`CMSView`](../interfaces/CMSView.md)[] \| [`CMSViewsBuilder`](CMSViewsBuilder.md) | Custom additional views created by the developer, added to the main navigation |

#### Defined in

[lib/src/firebase_app/FirebaseCMSAppProps.tsx:26](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/FirebaseCMSAppProps.tsx#L26)
