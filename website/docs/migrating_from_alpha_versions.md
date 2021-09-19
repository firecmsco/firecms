---
id: migrating_from_alpha_versions
title: Migrating from alpha versions
sidebar_label: Migrating from alpha versions
---

If you were using the app in the alpha versions (before 1.0.0), you will find
many **breaking changes**. We have done a lot of internal refactorings with the
primary goal of making internal and external APIs more predictable and
consistent.

## Core dependencies update

In version 1.0.0 there are major updates to some dependencies, now using:

- MaterialUI v5
- React Router v6
- Firebase JS SDK 9

Unfortunately we still need to rely on FirebaseUI, which still uses the compat
version of Firebase JS SDK 9, so tree shaking has no effect.

## Separation of concerns

We are taking steps to abstract away all the Firebase specific details behind
our own interfaces, giving developers more flexibility, even allowing to replace
the Firestore datasource, the Firebase Storage implementation or the Firebase
auth mechanism. If you are using `CMSApp` (called
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
  that that implementation of FireCMS uses Firebase as the backend

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

- `AuthController` no longer has `extra` and `setExtra` props. If you need that
  functionality, you can use the `extra` field in the `User`

- `PermissionsBuilder` no longer has an `authController` prop, but it can still
  be accessed through the `context` prop. Related, the new `User` type includes
  an `extra` field you can use to store additional user data, such as roles.
  See https://github.com/Camberi/firecms/blob/master/example/src/CustomCMSApp.tsx
  for an example

- `Authenticator` now receives an object with a `user` field instead of a `User`

- `FormContext` `entitySchema` is now called `schema`

- `field` prop in properties has been renamed to `Field`
- `preview` prop in properties has been renamed to `Preview`

- If you were using `CMSAppProvider` and `CMSMainView`, they have been largely
  refactored, and now you will need to implement a bunch of extra stuff if you
  want to go down the super custom road. You will be responsible for
  initialising the material theme, Firebase (or your own backend) and providing
  the Router. On the plus side, this is going to give you a ton of room for
  customisation. You can check a complete example in:
  https://github.com/Camberi/firecms/blob/master/example/src/CustomCMSApp.tsx

## Text search

The **text search** functionality has been moved to the datasource and removed
from the collection level. In your collection, you can now set
the `textSearchEnabled` flag to true to display the search bar.

This goes in the direction of building a generic core of the CMS that is not
directly coupled with Firebase/Firestore


