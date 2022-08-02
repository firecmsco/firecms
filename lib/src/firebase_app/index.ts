export * from "./hooks/useBuildFirebaseAuthDelegate";
export * from "./hooks/useFirestoreDataSource";
export * from "./hooks/useFirebaseStorageSource";

export { FirebaseCMSApp } from "./FirebaseCMSApp";
export type { FirebaseCMSAppProps, EntityCollectionsBuilder, CMSViewsBuilder } from "./FirebaseCMSAppProps";

export type { FirebaseLoginViewProps } from "./components/FirebaseLoginView";
export { FirebaseLoginView } from "./components/FirebaseLoginView";

export type { InitialiseFirebaseResult } from "./hooks/useInitialiseFirebase";
export { useInitialiseFirebase } from "./hooks/useInitialiseFirebase";

export * from "./models/auth";

export type { FirestoreTextSearchController } from "./models/text_search";
export { performAlgoliaTextSearch } from "./models/text_search";
