import { EntityCollection } from "../../models";
import { useNavigationContext } from "../../hooks";
import { EntityCollectionView, ErrorBoundary } from "../components";

/**
 * @category Components
 */
export interface NavigationEntityCollectionViewProps<M extends { [Key: string]: any }> {

    /**
     * Absolute path this collection view points to
     */
    fullPath: string;

    /**
     * Entity collection.
     * If not specified it will try to be inferred by the path
     */
    overriddenCollection?: EntityCollection<M>;

}

export function NavigationEntityCollectionView<M extends { [Key: string]: unknown }>({
                                                                                         fullPath,
                                                                                         overriddenCollection: baseCollection
                                                                                     }: NavigationEntityCollectionViewProps<M>) {

    const navigationContext = useNavigationContext();
    const collectionFromPath = navigationContext.getCollection<M>(fullPath, undefined, true);

    const collection: EntityCollection<M> | undefined = collectionFromPath ?? baseCollection;
    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${fullPath}`);
    }

    return (
        <ErrorBoundary>
            <EntityCollectionView fullPath={fullPath}
                                  {...collection}/>
        </ErrorBoundary>
    );

}
