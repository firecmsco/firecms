import { useMemo, useState } from "react";
import { EntityCollection, PartialEntityCollection } from "../../models";
import { mergeDeep } from "../util/objects";
import { useSchemaRegistryController } from "../../hooks/useSchemaRegistryController";

export function useCollectionPersist<M>({
                                               path,
                                           }: { path: string }) {

    const schemaRegistry = useSchemaRegistryController();
    const collectionResolver = schemaRegistry.getCollectionResolver(path);
    if (!collectionResolver) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
    }

    const [modifiedCollection, setModifiedCollection] = useState<PartialEntityCollection<M>>({});
    const collection: EntityCollection = useMemo(() => mergeDeep(collectionResolver, modifiedCollection), [collectionResolver, modifiedCollection]);

    const onCollectionModifiedForUser = (partialCollection: PartialEntityCollection<M>) => {
        const newCollection: PartialEntityCollection<M> = mergeDeep(modifiedCollection, partialCollection);
        schemaRegistry.onCollectionModifiedForUser(path, newCollection);
        setModifiedCollection(newCollection);
    }

    return { collection, onCollectionModifiedForUser };
}

