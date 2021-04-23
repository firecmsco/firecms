import { useEffect, useState } from "react";
import {
    Entity,
    EntitySchema,
    fetchEntity,
    TextSearchDelegate
} from "../models";

export interface TextSearchProps<S extends EntitySchema<Key>, Key extends string> {

    searchString?: string;

    textSearchDelegate?: TextSearchDelegate;

    collectionPath: string;

    schema: S;

}

export type TextSearchResult<S extends EntitySchema<Key>, Key extends string> = {
    textSearchData: Entity<S, Key>[]
    textSearchLoading: boolean,
}

export function useTextSearch<S extends EntitySchema<Key>, Key extends string>(
    {
        searchString,
        textSearchDelegate,
        collectionPath,
        schema
    }: TextSearchProps<S, Key>): TextSearchResult<S, Key> {

    const [textSearchLoading, setTextSearchLoading] = useState<boolean>(false);
    const [textSearchData, setTextSearchData] = useState<Entity<S, Key>[]>([]);

    async function onTextSearch(searchString?: string) {
        if (textSearchDelegate) {
            setTextSearchLoading(true);
            if (!searchString) {
                setTextSearchData([]);
            } else {
                const ids = await textSearchDelegate.performTextSearch(searchString);
                const promises: Promise<Entity<S, Key>>[] = ids
                    .map((id) => fetchEntity(collectionPath, id, schema)
                    );
                const entities = await Promise.all(promises);
                setTextSearchData(entities);
            }
            setTextSearchLoading(false);
        }
    }

    useEffect(() => {

        if (searchString) {
            onTextSearch(searchString).then();
        } else {
            setTextSearchData([]);
            setTextSearchLoading(false);
        }

    }, [collectionPath, schema, textSearchDelegate, searchString]);

    return {
        textSearchData,
        textSearchLoading
    };

}
