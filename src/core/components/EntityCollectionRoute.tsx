import React, { useEffect, useState } from "react";
import { EntityCollection } from "../../models";
import EntityCollectionView from "./EntityCollectionView";
import { CircularProgressCenter } from "./CircularProgressCenter";
import { useConfigurationPersistence } from "../../hooks/useConfigurationPersistence";
import { CollectionEditor } from "./SchemaEditor/CollectionEditor";
import { ErrorView } from "./ErrorView";

/**
 * @category Components
 */
export interface EntityCollectionRouteProps<M extends { [Key: string]: any }> {
    path: string;
    collection?: EntityCollection<M>;
}

/**
 * @category Components
 */
export function EntityCollectionRoute<M extends { [Key: string]: any }>({
                                                                            path,
                                                                            collection: baseCollection,
                                                                        }: EntityCollectionRouteProps<M>
) {
    const [collection, setCollection] = useState<EntityCollection<M> | undefined>();

    const [storedCollection, setStoredCollection] = useState<EntityCollection<M> | undefined>(baseCollection);
    const [loading, setLoading] = useState(false);

    const configPersistence = useConfigurationPersistence();

    if (!configPersistence) {
        throw Error("Trying to edit a stored collection without configuration persistence");
    }

    useEffect(() => {
        if (!baseCollection) return;
            setStoredCollection(baseCollection);
    }, [path, configPersistence])

    if (collection)
        return <EntityCollectionView path={path}
                                     collection={collection}
                                     editable={false}/>;

    else if (storedCollection) {
        if (storedCollection.schemaId)
            return <EntityCollectionView
                editable={true}
                path={path}
                collection={storedCollection}/>;
        else
            return <CollectionEditor path={path}/>;
    } else if (loading)
        return <CircularProgressCenter/>;

    else return <ErrorView
            error={"Internal error: EntityCollectionRoute misconfigured"}/>;

}


