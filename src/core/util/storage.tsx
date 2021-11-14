import { AnyProperty, EntityCollection, EntitySchema } from "../../models";


export type PartialProperties<M> = Record<any, Partial<AnyProperty>>;

export type PartialEntityCollection<M> =
    Omit<Partial<EntityCollection<M>>, "schema">
    & {
    schema:
        Omit<Partial<EntitySchema<M>>, "properties"> &
        {
            properties: PartialProperties<M>
        }
}

/**
 * Remove the entity ids from a given path
 * `products/B44RG6APH/locales` => `products/locales`
 * @param path
 */
function stripCollectionPath(path: string): string {
    return path
        .split("/")
        .filter((e, i) => i % 2 == 0)
        .reduce((a, b) => `${a}/${b}`);
}

export function saveCollectionConfig<M>(path: string, data: PartialEntityCollection<M>) {
    const storageKey = `collection_config_${stripCollectionPath(path)}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
}

export function getCollectionConfig<M>(path: string): PartialEntityCollection<M> {
    const storageKey = `collection_config_${stripCollectionPath(path)}`;
    const item = localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : {};
}
