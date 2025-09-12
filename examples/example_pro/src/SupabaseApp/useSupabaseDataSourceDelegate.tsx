import {
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionDelegateProps,
    FetchEntityProps,
    FilterValues,
    SaveEntityDelegateProps,
    WhereFilterOp
} from "@firecms/core";

import { SupabaseClient } from "@supabase/supabase-js";
import { useCallback } from "react";

/**
 * @group Supabase
 */
export interface SupabaseDataSourceProps {
    supabase: SupabaseClient;
}

export type SupabaseDelegate = DataSourceDelegate & {
    initTextSearch: (props: {
        path: string,
        databaseId?: string,
        collection?: EntityCollection 
    }) => Promise<boolean>,
}

/**
 * Use this hook to build a {@link DataSource} based on Supabase
 * @param supabaseClient
 * @group Supabase
 */
export function useSupabaseDelegate({ supabase }: SupabaseDataSourceProps): SupabaseDelegate {
    const buildQuery = useCallback(async (
        path: string,
        filter: FilterValues<any> | undefined,
        orderBy: string | undefined,
        order: "desc" | "asc" | undefined,
        startAfter: any[] | undefined,
        limit: number | undefined,
        count: boolean
    ) => {
        let query = supabase.from(path).select("*", { count: count ? "exact" : undefined });

        if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
                const [op, val] = value as [WhereFilterOp, any];
                // @ts-ignore
                query = query[op](key, val);
            });
        }

        if (orderBy && order) {
            query = query.order(orderBy, { ascending: order === "asc" });
        }

        if (startAfter) {
            query = query.gt("id", startAfter[startAfter.length - 1]);
        }

        if (limit) {
            query = query.limit(limit);
        }

        return query;
    }, [supabase]);

    const getAndBuildEntity = useCallback(async <M extends Record<string, any>>(
        path: string,
        entityId: string | number,
        databaseId?: string
    ): Promise<Entity<M> | undefined> => {
        const {
            data,
            error
        } = await supabase
            .from(path)
            .select("*")
            .eq("id", entityId)
            .single();

        if (error) {
            throw error;
        }
        return createEntityFromDocument(data, path, databaseId);
    }, [supabase]);

    // const listenEntity = useCallback((
    //     {
    //         path,
    //         entityId,
    //         collection,
    //         onUpdate,
    //         onError
    //     }: ListenEntityProps
    // ): () => void => {
    //     const subscription = supabaseClient
    //         .from(`${path}:id=eq.${entityId}`)
    //         .on("*", payload => onUpdate(createEntityFromDocument(payload.new, collection?.databaseId)))
    //         .subscribe();
    //
    //     return () => {
    //         subscription.unsubscribe();
    //     };
    // }, [supabaseClient]);

    const fetchCollection = useCallback(async <M extends Record<string, any>>(
        props: FetchCollectionDelegateProps<M>
    ): Promise<Entity<M>[]> => {
        const {
            path,
            filter,
            limit,
            orderBy,
            order,
            startAfter
        } = props;

        const {
            data,
            error
        } = await buildQuery(path, filter, orderBy, order, startAfter, limit, false);

        if (error) {
            throw error;
        }
        return data.map((doc: any) => createEntityFromDocument(doc, path, props.collection?.databaseId));
    }, [buildQuery]);

    // const listenCollection = useCallback(<M extends Record<string, any>>(
    //     { path, onUpdate, onError }: ListenEntityProps<M>
    // ): () => void => {
    //     const subscription = supabaseClient
    //         .from(path)
    //         .on('INSERT', (payload) => {
    //             // For inserted entities
    //             const newEntity = {
    //                 id: payload.new.id,
    //                 path,
    //                 values: payload.new
    //             } as Entity<M>;
    //             onUpdate(prevEntities => [...prevEntities, newEntity]);
    //         })
    //         .on('UPDATE', (payload) => {
    //             // For updated entities, replace the old one in the list
    //             const updatedEntity = {
    //                 id: payload.new.id,
    //                 path,
    //                 values: payload.new
    //             } as Entity<M>;
    //             onUpdate(prevEntities => {
    //                 return prevEntities.map(entity =>
    //                     entity.id === updatedEntity.id ? updatedEntity : entity
    //                 );
    //             });
    //         })
    //         .on('DELETE', (payload) => {
    //             // For deleted entities
    //             onUpdate(prevEntities =>
    //                 prevEntities.filter(entity => entity.id !== payload.old.id)
    //             );
    //         })
    //         .subscribe();
    //
    //     return () => {
    //         subscription.unsubscribe(); // Unsubscribes from real-time updates
    //     };
    // }, [supabaseClient]);

    const fetchEntity = useCallback(<M extends Record<string, any>>(
        props: FetchEntityProps<M>
    ): Promise<Entity<M> | undefined> => {
        const {
            path,
            entityId,
            collection
        } = props;
        return getAndBuildEntity(path, entityId, collection?.databaseId);
    }, [getAndBuildEntity]);

    const saveEntity = useCallback(<M extends Record<string, any>>(
        props: SaveEntityDelegateProps<M>
    ): Promise<Entity<M>> => {
        const {
            path,
            entityId,
            values,
            collection,
            status
        } = props;
        if (entityId) {
            return new Promise<Entity<M>>((resolve, reject) => {
                supabase
                    .from(path)
                    .update(values)
                    .eq("id", entityId)
                    .then(({
                               data,
                               error
                           }) => {
                        if (error) {
                            reject(error);
                        }
                        console.log("Supabase: Entity saved", data);
                        return resolve({
                            id: entityId,
                            path,
                            values: values as M
                        } as Entity<M>)
                    }, (error) => {
                        console.error("Supabase: Error saving entity", error);
                        reject(error);
                    });
            });
        } else {
            const newId = crypto.randomUUID();

            return new Promise<Entity<M>>((resolve, reject) => {
                supabase
                    .from(path)
                    .insert({
                        id: newId,
                        ...values
                    })
                    .single()
                    .then(({ data, error }) => {
                        if (error) {
                            reject(error);
                        }
                        if (!data) {
                            throw new Error("No data returned");
                        }
                        console.log("Supabase: Entity saved", data);
                        return resolve({
                            // gen new uuid
                            id: newId,
                            path,
                            values: values as M
                        })
                    }, (error) => {
                        console.error("Supabase: Error saving entity", error);
                        reject(error);
                    });
            });
        }
    }, [supabase]);

    const deleteEntity = useCallback(<M extends Record<string, any>>(
        props: DeleteEntityProps<M>
    ): Promise<void> => {
        const { entity } = props;
        return Promise.resolve(supabase
            .from(entity.path)
            .delete()
            .eq("id", entity.id)
            .then(() => {
            }));
    }, [supabase]);

    const checkUniqueField = useCallback(async (
        path: string,
        name: string,
        value: any,
        entityId?: string,
        collection?: EntityCollection<any>
    ): Promise<boolean> => {
        const {
            data,
            error
        } = await supabase
            .from(path)
            .select("*")
            .eq(name, value)
            .neq("id", entityId)
            .single();

        if (error) {
            throw error;
        }
        return !data;
    }, [supabase]);

    const generateEntityId = useCallback((path: string): string => {
        return crypto.randomUUID();
    }, []);

    const countEntities = useCallback(async (
        props: FetchCollectionDelegateProps
    ): Promise<number> => {
        const {
            path,
            filter
        } = props;
        const {
            count,
            error
        } = await buildQuery(path, filter, undefined, undefined, undefined, undefined, true);

        if (error) {
            throw error;
        }
        if (!count) {
            return 0;
        }
        return count;
    }, [buildQuery]);

    const isFilterCombinationValid = useCallback((props: {
        path: string,
        collection: EntityCollection<any>,
        filterValues: FilterValues<any>,
        sortBy?: [string, "asc" | "desc"]
    }): boolean => {
        return true;
    }, []);

    return {
        key: "supabase",
        setDateToMidnight: (date: Date) => {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        },
        delegateToCMSModel: (data) => data,
        cmsToDelegateModel: (data) => data,
        currentTime: () => new Date(),
        initialised: true,
        fetchCollection,
        // listenCollection,
        fetchEntity,
        // listenEntity,
        saveEntity,
        deleteEntity,
        checkUniqueField,
        generateEntityId,
        countEntities,
        isFilterCombinationValid,
        initTextSearch: async (): Promise<boolean> => {
            return true;
        }
    };
}

const createEntityFromDocument = <M extends Record<string, any>>(
    data: any,
    path: string,
    databaseId?: string
): Entity<M> => {
    return {
        id: data.id,
        path,
        values: data,
        databaseId
    };
};
