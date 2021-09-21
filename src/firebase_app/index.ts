import { InitialiseFirebaseResult } from "./hooks/useInitialiseFirebase";

export {
    useFirebaseAuthController
} from "./hooks/useFirebaseAuthController";

export {
    useFirestoreDataSource
} from "./hooks/useFirestoreDataSource";

export {
    useFirebaseStorageSource
} from "./hooks/useFirebaseStorageSource";

export { FirebaseCMSApp } from "./FirebaseCMSApp";
export type {
    FirebaseCMSAppProps
} from "./FirebaseCMSAppProps";

export type { FirebaseLoginViewProps } from "./components/FirebaseLoginView";
export {
    default as FirebaseLoginView
} from "./components/FirebaseLoginView";

export type { InitialiseFirebaseResult } from "./hooks/useInitialiseFirebase";
export { useInitialiseFirebase } from "./hooks/useInitialiseFirebase";

export type { FirestoreTextSearchController } from "./models/text_search";
export { performAlgoliaTextSearch } from "./models/text_search";

export * from "./models/authenticator";
