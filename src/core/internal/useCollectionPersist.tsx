import { useMemo, useState } from "react";
import { EntityCollection, PartialEntityCollection } from "../../models";
import { mergeDeep } from "../util/objects";
import { useNavigation } from "../../hooks";

export function useCollectionPersist<M>({
                                               path,
                                           }: { path: string }) {

    const navigationContext = useNavigation();
    const collectionResolver = navigationContext.getCollectionResolver(path);
    if (!collectionResolver) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
    }

    const [modifiedCollection, setModifiedCollection] = useState<PartialEntityCollection<M>>({});
    const collection: EntityCollection = useMemo(() => mergeDeep(collectionResolver, modifiedCollection), [collectionResolver, modifiedCollection]);

    const onCollectionModifiedForUser = (partialCollection: PartialEntityCollection<M>) => {
        const newCollection: PartialEntityCollection<M> = mergeDeep(modifiedCollection, partialCollection);
        navigationContext.onCollectionModifiedForUser(path, newCollection);
        setModifiedCollection(newCollection);
    }

    return { collection, onCollectionModifiedForUser };
}

