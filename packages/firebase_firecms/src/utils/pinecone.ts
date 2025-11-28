import { User as FirebaseUser } from "@firebase/auth";
import { FirestoreTextSearchController, FirestoreTextSearchControllerBuilder } from "../types";
import { EntityCollection, ResolvedEntityCollection } from "@firecms/core";

const DEFAULT_SERVER = "https://api.firecms.co";

/**
 * Utility function to perform a text search in an algolia index,
 * returning the ids of the entities.
 * @param index
 * @param query
 * @group Firebase
 */
export async function performPineconeTextSearch({
                                                   host = DEFAULT_SERVER,
                                                   firebaseToken,
                                                   projectId,
                                                   collectionPath,
                                                   query
                                               }: {
    host?: string,
    firebaseToken: string,
    collectionPath: string,
    projectId: string,
    query: string
}): Promise<readonly string[]> {

    console.debug("Performing Pinecone query", collectionPath, query);
    const response = await fetch((host ?? DEFAULT_SERVER) + `/projects/${projectId}/search/${collectionPath}`,
        {
            // mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${firebaseToken}`,
                // "x-de-version": version
            },
            body: JSON.stringify({
                query
            })
        });

    const promise = await response.json();
    return promise.data.ids;

}

export function buildPineconeSearchController({
                                                 isPathSupported,
                                                 search
                                             }: {
    isPathSupported: (path: string) => boolean,
    search: (props: {
        searchString: string,
        path: string,
        currentUser?: FirebaseUser
    }) => Promise<readonly string[] | undefined>,
}): FirestoreTextSearchControllerBuilder {
    return (props): FirestoreTextSearchController => {

        const init = (props: {
            path: string,
            collection?: EntityCollection | ResolvedEntityCollection
        }) => {
            // do nothing
            return Promise.resolve(isPathSupported(props.path));
        }

        return {
            init,
            search
        }
    }

}
