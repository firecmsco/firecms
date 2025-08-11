import { FirestoreTextSearchController, FirestoreTextSearchControllerBuilder } from "../types";
import { EntityCollection, ResolvedEntityCollection } from "@firecms/core";

/**
 * Utility function to perform a text search in an external index,
 * returning the ids of the entities.
 * @group Firebase
 */
export function buildExternalSearchController({
                                                 isPathSupported,
                                                 search
                                             }: {
    isPathSupported: (path: string) => boolean,
    search: (props: {
        searchString: string,
        path: string
    }) => Promise<readonly string[] | undefined>,
}): FirestoreTextSearchControllerBuilder {
    return (props): FirestoreTextSearchController => {

        const init = (props: {
            path: string,
            collection?: EntityCollection | ResolvedEntityCollection
        }) => {
            return Promise.resolve(isPathSupported(props.path));
        }

        return {
            init,
            search
        }
    }

}
