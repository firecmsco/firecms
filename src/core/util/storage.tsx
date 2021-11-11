import { AnyProperty, EntityCollection, EntitySchema } from "../../models";


export type PartialProperties<M> = Record<any, Partial<AnyProperty>>;

export type PartialEntityCollection<M> = Omit<Partial<EntityCollection<M>>, "schema"> & {
    schema:
        Omit<Partial<EntitySchema<M>>, "properties"> &
        {
            properties: PartialProperties<M>
        }
}

export function saveCollectionConfig<M>(path: string, data: PartialEntityCollection<M>) {
    const storageKey = `collection_config_${path}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
}

export function getCollectionConfig<M>(path: string): PartialEntityCollection<M> {
    const storageKey = `collection_config_${path}`;
    const item = localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : {};
}
