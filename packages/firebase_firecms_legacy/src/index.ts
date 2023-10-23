export * from "./hooks/useFirebaseAuthController";
export * from "./hooks/useFirestoreDataSource";
export * from "./hooks/useFirebaseStorageSource";
export * from "./hooks/useValidateAuthenticator";

export { FirebaseCMSApp } from "./FirebaseCMSApp";
export type { FirebaseCMSAppProps } from "./FirebaseCMSAppProps";

export type { FirebaseLoginViewProps } from "./components/FirebaseLoginView";
export { FirebaseLoginView, LoginButton } from "./components/FirebaseLoginView";

export type { InitialiseFirebaseResult } from "./hooks/useInitialiseFirebase";
export { useInitialiseFirebase } from "./hooks/useInitialiseFirebase";
export { useInitializeAppCheck } from "./hooks/useInitializeAppCheck";

export * from "./types/auth";

export type { FirestoreTextSearchController } from "./types/text_search";
export { performAlgoliaTextSearch } from "./types/text_search";
