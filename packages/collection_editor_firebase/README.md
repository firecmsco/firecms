## Firebase connector for FireCMS collection editor

This package provides a hook that allows to build a `CollectionConfigController` that
persists data to Firebase Firestore.

You can use the exposed `useFirestoreCollectionsConfigController` hook to create a controller.

This connector saves the collections config in Firestore.
You need to provide a `FirebaseApp` instance and the Firestore path where you
want to store the collections config.
Defaults to `"__FIRECMS/config/collections"`.

