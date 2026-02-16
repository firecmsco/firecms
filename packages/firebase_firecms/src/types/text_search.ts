import { User as FirebaseUser } from "@firebase/auth";
import { FirebaseApp } from "@firebase/app";
import { EntityCollection, ResolvedEntityCollection } from "@firecms/core";

export type FirestoreTextSearchControllerBuilder = (props: {
    firebaseApp: FirebaseApp;
}) => FirestoreTextSearchController;

/**
 * Use this controller to return a list of ids from a search index, given a
 * `path` and a `searchString`.
 * Firestore does not support text search directly, so we need to rely on an external
 * index, such as Algolia.
 * Note that you will get text search requests for collections that have the
 * `textSearchEnabled` flag set to `true`.
 * @see performAlgoliaTextSearch
 * @group Firebase
 */
export type FirestoreTextSearchController = {
    /**
     * This method is called when a search delegate is ready to be used.
     * Return true if this path can be handled by this controller.
     * @param props
     */
    init: (props: {
        path: string,
        databaseId?: string,
        collection?: EntityCollection | ResolvedEntityCollection
    }) => Promise<boolean>,
    /**
     * Do the search and return a list of ids.
     * @param props
     */
    search: (props: {
        searchString: string,
        path: string,
        currentUser?: FirebaseUser,
        databaseId?: string,
        collection?: EntityCollection | ResolvedEntityCollection
    }) => (Promise<readonly string[] | undefined>),

};
