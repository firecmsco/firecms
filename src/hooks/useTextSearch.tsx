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
                const promises: Promise<Entity<S, Key> | null>[] = ids
                    .map(async (id) => {
                            try {
                                return await fetchEntity(collectionPath, id, schema);
                            } catch (e) {
                                console.error(e);
                                return null;
                            }
                        }
                    );
                const entities = (await Promise.all(promises))
                    .filter((e) => e !== null && e.values) as Entity<S, Key>[];
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
