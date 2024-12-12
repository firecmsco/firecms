import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import {
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    FilterValues,
    SaveEntityProps
} from "@firecms/core";

const client = new ApolloClient({
    uri: "http://localhost:4000/graphql",
    cache: new InMemoryCache()
});

export class GraphQLDataSource implements DataSourceDelegate {
    key = "graphql";

    initialised = true;

    delegateToCMSModel(data: any): any {
        return graphQLToCMSModel(data);
    }

    cmsToDelegateModel(data: any): any {
        return cmsToGraphQLModel(data);
    }

    async fetchEntity<M extends Record<string, any> = any>({
                                                               path,
                                                               entityId
                                                           }: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
        const filter: FilterValues<Extract<string, string>> = { _id: ["==", entityId] };

        const collection = await this.fetchCollection<M>({
            path,
            filter,
            limit: 1
        });

        return collection.length > 0 ? collection[0] : undefined;
    }

    async fetchCollection<M extends Record<string, any> = any>({
                                                                   path,
                                                                   filter,
                                                                   limit,
                                                                   startAfter,
                                                                   orderBy,
                                                                   order,
                                                                   searchString
                                                               }: FetchCollectionProps<M>): Promise<Entity<M>[]> {
        const gqlFilters = Object.entries(filter ?? {})
            .map(([key, [op, value]]: any) => ({
                field: key,
                op,
                value
            }));

        const queryResult = await client.query({
            query: gql`
                query (
                    $collectionName: String!, 
                    $filters: [FilterInput!], 
                    $limit: Int, 
                    $orderBy: String, 
                    $order: String, 
                    $searchString: String
                ) {
                    dynamicQuery(
                        collectionName: $collectionName,
                        filters: $filters, 
                        sort: { field: $orderBy, order: $order },
                        searchString: $searchString,
                        limit: $limit
                    ) {
                        _id
                        ... on JSONObject {}
                    }
                }
            `,
            variables: {
                collectionName: path,
                filters: gqlFilters,
                orderBy,
                order,
                searchString,
                limit
            }
        });

        return queryResult.data.dynamicQuery.map((item: any) => ({
            id: item._id,
            values: this.delegateToCMSModel(item)
        }));
    }

    async saveEntity<M extends Record<string, any> = any>({
                                                              path,
                                                              entityId,
                                                              values
                                                          }: SaveEntityProps<M>): Promise<Entity<M>> {
        const mutationResult = await client.mutate({
            mutation: gql`
                mutation (
                    $collectionName: String!,
                    $id: String,
                    $values: JSONObject!
                ) {
                    saveEntity(
                        collectionName: $collectionName,
                        id: $id,
                        values: $values
                    ) {
                        _id
                        ... on JSONObject {}
                    }
                }
            `,
            variables: {
                collectionName: path,
                id: entityId,
                values: this.cmsToDelegateModel(values)
            }
        });

        const savedEntity = mutationResult.data.saveEntity;
        return {
            id: savedEntity._id,
            path,
            values: this.delegateToCMSModel(savedEntity)
        };
    }

    async deleteEntity<M extends Record<string, any> = any>({
                                                                entity
                                                            }: DeleteEntityProps<M>): Promise<void> {
        await client.mutate({
            mutation: gql`
                mutation (
                    $collectionName: String!,
                    $id: String!
                ) {
                    deleteEntity(
                        collectionName: $collectionName,
                        id: $id
                    ) {
                        id
                    }
                }
            `,
            variables: {
                collectionName: entity.path,
                id: entity.id
            }
        });
    }

    async checkUniqueField(path: string, name: string, value: any): Promise<boolean> {
        const filter: FilterValues<string> = { [name]: ["==", value] };
        const collection = await this.fetchCollection({
            path,
            filter
        });
        return collection.length === 0;
    }

    generateEntityId(path: string, collection: EntityCollection): string {
        return `${path}_${Date.now()}`;
    }

    setDateToMidnight(input?: any): any {
        if (input instanceof Date) {
            input.setHours(0, 0, 0, 0);
            return input;
        }
        return input;
    }
}

export function graphQLToCMSModel(data: any): any {
    if (data === null || data === undefined) return null;

    if (Array.isArray(data)) {
        return data.map(graphQLToCMSModel).filter(v => v !== undefined);
    }

    if (typeof data === "object") {
        const result: Record<string, any> = {};

        if (data._id) {
            result.id = data._id;
        }

        for (const key of Object.keys(data)) {
            const childValue = graphQLToCMSModel(data[key]);
            if (childValue !== undefined) result[key] = childValue;
        }
        return result;
    }

    return data; // Pass through simple data types as is
}

export function cmsToGraphQLModel(data: any): any {
    if (data === undefined) return null;

    if (Array.isArray(data)) {
        return data.map(v => cmsToGraphQLModel(v));
    }

    if (typeof data === "object") {
        const result: Record<string, any> = {};

        if (data.id) {
            result._id = data.id;
        }

        Object.entries(data).forEach(([key, v]) => {
            if (key !== "id") { // Avoid duplicating id to _id
                result[key] = cmsToGraphQLModel(v);
            }
        });

        return result;
    }

    return data; // Pass through simple data types as is
}
