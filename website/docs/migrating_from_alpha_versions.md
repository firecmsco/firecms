---
id: migrating_from_alpha_versions
title: Migrating from alpha versions
sidebar_label: Migrating from alpha versions
---

If you were using the app in the alpha versions (before 1.0.0-beta1), you will
find many **breaking changes**. We have done a lot of internal refactorings with
the primary goal of making internal and external APIs more predictable and
consistent.

Oh, and we have a very awesome new dark theme too ;)

## Core dependencies update

In version 1.0.0 there are major updates to some dependencies, now using:

- MaterialUI v5
- React Router v6
- Firebase JS SDK 9

Run this command to add the new dependencies:

```
yarn add @camberi/firecms firebase@9 @mui/material@5 @mui/icons-material@5 @mui/lab@5 @mui/styles@5 @emotion/react @emotion/styled react-router@^6.0.0-beta.7 react-router-dom@6.0.0-beta.5
```

> You may want to remove previous dependencies to @material-ui

Unfortunately we still need to rely on FirebaseUI, which still uses the compat
version of Firebase JS SDK 9, so tree shaking has no effect.

## Separation of concerns

We are taking steps to abstract away all the Firebase specific details behind
our own interfaces, giving developers more flexibility, even allowing to replace
the Firestore datasource, the Firebase Storage implementation or the Firebase
auth mechanism.

All the code related to Firebase/Firestore is now located in an internal package
called `firebase_app` and it is the only place where there are references to
Firebase code. Essentially, you can build a CMS replacing all the services
without touching that specific package.

If you are using `CMSApp` (called
`FirebaseCMSApp` from now on), you will not be largely impacted by the changes
in this update, besides the callbacks and props specified bellow.

There are two new classes that replace the Firebase ones:

- `EntityReference`
- `GeoPoint` (though the field is not implemented)

If you have any models that use Firebase references such as:

```tsx
import firebase from "firebase/app";

type User = {
    // ...
    liked_products: firebase.firestore.DocumentReference[];
}
```

you should replace them by:

```tsx
import { EntityReference } from "@camberi/firecms";

type User = {
    // ...
    liked_products: EntityReference[];
}
```

## API changes

- **`CMSApp` has been renamed to `FirebaseCMSApp`** in order to better reflect
  that that implementation of `FireCMS` uses Firebase as the backend.

- `CMSAppProvider` has been renamed to `FireCMS`, it is now the main component
  of the CMS, in charge of initialising navigation and all the contexts.

- `CMSAppContext` has been renamed to `FireCMSContext`.
- `useCMSAppContext` has been renamed to `useFireCMSContext`.

- General callbacks refactor. **All callbacks** now always return a single
  object with the props as fields. The goal of this change is to make them
  predictable and remove inconsistencies:
    - Every field that was previously called `collectionPath` now is simply
      called `path`.
    - Every field that was previously called `entitySchema` now is simply
      called `schema`.
    - All entity id fields are now renamed to `entityId` (with the only
      exception of the field `id` in `Entity`).

- `AuthController` `loggedUser` renamed to `user`

- `EntitySaveProps` renamed to `EntityOnSaveProps`

- `EntityDeleteProps` renamed to `EntityOnDeleteProps`

- `UploadedFileContext` `entityValues` renamed to `values`

- `useNavigationFrom` renamed to `useResolvedNavigationFrom`
- `getNavigationFrom` renamed to `resolveNavigationFrom`

- `AdditionalColumnDelegate` `builder` prop now receives an object including the
  entity and the app context, instead of only the entity as before:

```tsx
// Previous
const previousProductAdditionalColumn: AdditionalColumnDelegate<Product> = {
    id: "spanish_title",
    title: "Spanish title",
    builder: (entity: Entity<Product>) =>
        <div>{entity.values.title}</div>
};

// Now
const productAdditionalColumn: AdditionalColumnDelegate<Product> = {
    id: "spanish_title",
    title: "Spanish title",
    builder: ({ entity }) =>
        <div>{entity.values.title}</div>
};
```

- `Authenticator` now receives an object with a `user` field instead of a `User`
  . It is also generically typed now, so you can specify the type for the user.
  If you are using the default `FirebaseCMSApp`, you can specify your
  authenticator like:
```tsx
import { User as FirebaseUser } from "firebase/auth";
const myAuthenticator: Authenticator<FirebaseUser> = async ({
                                                                user,
                                                                authController
                                                            }) => {
    console.log("Allowing access to", user?.email);
    // ...
    return true;
};
```

- `FormContext` `entitySchema` is now called `schema`

- `field` prop in properties has been renamed to `Field`

- `preview` prop in properties has been renamed to `Preview`

- `indexes` prop in `EntityCollection` has been renamed to `filterCombinations`

- `relativePath` prop in `EntityCollection` has been renamed to `path`

- If you were using `CMSAppProvider` and `CMSMainView`, they have been largely
  refactored, and now you will need to implement a bunch of extra stuff if you
  want to go down the super custom road. Those components have now been turned
  into:
    - [`FireCMS`](api/functions/firecms.md)
    - [`Scaffold`](api/functions/scaffold.md)
    - [`NavigationRoutes`](api/functions/navigationroutes.md)
    - [`SideEntityDialogs`](api/functions/sideentitydialogs.md)

  You will be responsible for initialising the material theme, Firebase (or your
  own backend) and providing the Router. On the plus side, this is going to give
  you a ton of room for customisation. You can check a complete example in:
  https://github.com/Camberi/firecms/blob/master/example/src/CustomCMSApp.tsx

## Text search

The **text search** functionality has been moved to the datasource and removed
from the collection level. In your collection, you can now set
the `textSearchEnabled` flag to true to display the search bar.

This goes in the direction of building a generic core of the CMS that is not
directly coupled with Firebase/Firestore. We have removed search delegates at
the collection level, and now you can find them at the datasource level.

The interface created for the Datasource is now agnostic, and we understand that
the text search is part of the API in `listenCollection` or `fetchCollection`,
instead of being a separate delegate, like until now.

The text search implementation has been moved to the `firebase_app` level. You
can now define a `FirestoreTextSearchController` where you need to return the
search ids, based on the collection `path` and the `searchString`, instead of
having a single TextSearchDelegate per collection.

Check an example of the [new implementation](./firebase_cms_app#text-search)

## Saving and deleting callbacks

The callbacks that were previously related to a schema have been moved to the
collection level, and are now bundled up under the optional `callbacks` prop.


